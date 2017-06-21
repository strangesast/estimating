import Dexie from 'dexie';
import * as sha1 from 'js-sha1';
import { modes, decoders, encoders, frame, deframe } from './util';
import { Commit, ProjectComponent, ProjectComponentInstance, ProjectFolder, ProjectObject, IndexMap, RefRecord, IndexRecord, ObjectRecord } from './models';

const refPrefix = 'ref: ';
const validBranch = /^[A-Za-z0-9]+([-\/][A-Za-z0-9]+)*$/;
const validHash = /[0-9A-Fa-f]{40}/;

export class Git extends Dexie {
  HEAD: string;

  refs: Dexie.Table<RefRecord, string>;
  objects: Dexie.Table<ObjectRecord, string>;
  index: Dexie.Table<IndexRecord, string>;

  constructor(private wt: Dexie, name='git-store', version=1) {
    super(name);
    this.version(version).stores({
      refs: '[name+type],name,type,hash',
      objects: 'hash',
      index: 'path'
    });
  }

  async createBranch(branchName) {
    if (!validBranch.test(branchName)) throw new Error(`invalid branch name, "${ branchName }"`);
    let prefixed = refPrefix + branchName;
    let existing = await this.refs.get({ name: prefixed, type: 'local' });
    if (existing) {
      throw new Error('branch with that name already exists');
    }
    this.HEAD = prefixed;
  }

  async deleteBranch(branchName) {
    let head = this.HEAD;
    let prefixed = refPrefix + branchName;
    if (prefixed == head) {
      throw new Error('cannot delete current branch');
    }
    let result = await this.refs.where('[name+type]').equals([prefixed, 'local']).delete();
    if (result < 1) {
      throw new Error('no branch with that name');
    }
    return result;
  }

  // list local branches
  async listBranches(branchName, remote=false) {
    if (remote) {
      return this.refs.where({ type: 'local' }).sortBy('name');
    } else {
      return this.refs.orderBy('name');
    }
  }

  // updates records in the working tree to match the version in the
  // index or specified tree. if no paths are given, also updates HEAD.
  // git checkout <branch>
  async checkout(commitish) {
    let { ref, commit } = await this.readRef(commitish);
    let { type, hash, name } = ref;

    if (commit) {
      let index = this.flattenIndex();
      let headObjects = await this.flattenHead(commit.tree);
      let newIndex = [];
      for (let path in headObjects) {
        let i = index[path];
        if (i) {
        }
        let record = headObjects[path];
      }
    }

    // update wt

    if (type == 'remote') {
      // create new local branch
      await this.refs.add({ name, hash, type: 'local' });
    }


  }

  // compare two "flat" maps of indexmaps 
  diff(a: IndexMap, b: IndexMap) {
    let added = [], removed = [], modified = [];
    let keys = Object.keys(b).concat(Object.keys(a)).reduce((acc, key, i, arr) => arr.indexOf(key) == i ? acc.concat(key) : acc, []);
    for (let key of keys) {
      if (b[key] && a[key]) {
        if (b[key].hash !== a[key].hash) {
          modified.push(b[key]);
        }
      } else if (b[key]) {
        added.push(b[key]);
      } else {
        removed.push(a[key]);
      }
    }
    return { added, removed, modified };
  }

  // take a tree node and flatten out children blobs, resolving relative paths
  async flattenHead(head?:string): Promise<IndexMap> {
    head = head || this.HEAD;
    let { commit } = await this.readRef(head);
    let map = {};
    if (commit) {
      let tree = commit.tree;
      let gen = this.walkTrees(tree);
      for await (let { done, value } of this.walkTrees(tree)) {
        console.log('value', value);
      }
    }
    return map;
  }

  // manipulate index to indexmap
  async flattenIndex(): Promise<IndexMap> {
    let records = await this.index.toArray();
    let map = {};
    for (let record of records) {
      map[record.path] = record;
    }
    return map;
  }

  // look at work tree, build indexmap
  async flattenWorking(): Promise<IndexMap> {
    let tables = this.wt.tables;
    let map = {};
    for (let table of tables) {
      let name = table.name;
      for (let record of await table.toArray()) {
        let path = name + '/' + record.id;
        map[path] = wrapObject(record);
      }
    }
    return map;
  }

  // get a "flat" map of head, index, & working directory. diff between adjacent. head state
  async status(): Promise<any> {
    let head = this.HEAD;
    let branch = head && head.startsWith(refPrefix) && head.substring(refPrefix.length);
    let { commit, ref } = await this.readRef(head);

    // state
    let headObjects = await this.flattenHead();
    let indexObjects = await this.flattenIndex();
    let workingTreeObjects = await this.flattenWorking();

    // diffs
    let headIndex = this.diff(headObjects, indexObjects);
    let indexWorking = this.diff(indexObjects, workingTreeObjects);

    
    // if !commit, currently on orphan branch - mostly likely just-initalized, commit-less.
    // if !commit && !branch, INVALID
    // if commit && !branch, "detached head state"
    // if commit && branch "normal branch, at least one commit"

    if (!commit && !branch) throw new Error('invalid head state, no branch or commit');

    return {
      branch,
      commit,
      headIndex,
      indexWorking,
      objects: {
        head: headObjects,
        index: indexObjects,
        working: workingTreeObjects
      }
    };
  }

  // save a new obeject record
  async save(value: ObjectRecord) {
    // must have a hash
    // must have either
    //   a body and type OR
    //   buffer
    if (!value.hash || ((!value.body || !value.type) && !value.buffer)) throw new Error('invalid object record');
    return this.objects.put(value);
  }

  // add object (from db) to index
  async add(object: ProjectObject) {
    let result = await this.index.put(wrapObject(object));
    return result;
  }

  async remove(object: ProjectObject|string) {
  }

  async saveAs(type, value) {
    let encoder = encoders[type];
    if (!encoder) throw new Error('invalid type');
    let body = encoder(value);
    let buffer = frame({ type, body });
    let hash = sha1(buffer);
    return this.save({ type, hash, body, buffer });
  }

  async load(hash) {
    if (!validHash.test(hash)) throw new Error('invalid hash');
    let deframedType;
    let obj = await this.objects.get(hash);
    if (!obj) throw new Error('missing object for that hash');
    await this.calculateBody(obj, false, true);
    return obj;
  }

  async calculateBody(object: ObjectRecord, force=false, update=false) {
    // calcualte body based on buffer.  useful for unpacking encoded blobs
    let { type, body, buffer, hash } = object;
    if (!body || force) {
      let deframedType;
      if (!buffer) throw new Error('invalid or unserialized object');
      ({ type: deframedType, body } = deframe(buffer));
      if (type !== deframedType) throw new Error('invalid object');
      let decoder = decoders[type];
      if (!decoder) throw new Error('invalid type');
      body = decoder({ type, body });
      await this.objects.update(hash, { body });
      object.body = body;
    }
    return object;
  }

  async loadMany(hashes) {
    let objects = await this.objects.where('hash').anyOf(hashes).toArray();
    if (objects.length !== hashes) throw new Error('missing objects for those hashes');
    return objects;
  }

  async loadManyAs(type, hashes) {
    let objects = await this.loadMany(hashes);
    return objects.map(({ type: t, body }) => {
      if (type !== t) throw new Error('invalid type in requested hashes');
      return body;
    });
  }

  async loadAs(type, hash) {
    let { type: t, body } = await this.load(hash);
    if (type !== t) throw new Error('invalid type requested');
    return body;
  }

  async hashExists(hash) {
    return !!(await this.objects.get(hash));
  }

  // read a ref or commit hash and return the commit
  async readRef(commitish): Promise<{ commit: Commit, ref: RefRecord }> {
    if (typeof commitish !== 'string') throw new Error('commit-ish must be a string');

    let commit, ref;
    if (commitish.startsWith(refPrefix)) {
      ref = await this.refs.get({ name: commitish.substring(refPrefix.length) });
      commit = ref && await this.loadAs('commit', ref.hash);

    } else if (validHash.test(commitish)) {
      commit = await this.loadAs('commit', commitish);

    } else {
      throw new Error('invalid commitish');
    }
    return { ref, commit };
  }

  async *walkCommits(hash) {
    let commit = await this.loadAs('commit', hash) as Commit;
    if (!commit) throw new Error('invalid initial commit hash');
    let parents = commit.parents;
    do {
      if (!commit) throw new Error('invalid hash reference');
      yield commit;
      commit = await this.loadAs('commit', commit.parents[0]) as Commit;
    } while (commit && commit.parents.length == 1);
    yield commit;
    if (commit.parents.length > 1) {
      return 1;
    }
    return 0;
  }
  
  async *walkTrees(hash) {
    let root = await this.loadAs('tree', hash);
    let tree = { root: null };
  
    let children = [{ object: { name: 'root', type: 'tree', body: root }, context: tree }];
    let depth = 0;
  
    while (children.length) {
      let toLoad = {};
      for (let { object, context } of children) {
        let { type, body, name } = object;
        if (type == 'tree') {
          let subtree = {};
          context[name] = subtree;
          for (let name in body) {
            let { hash, mode } = body[name];
            toLoad[hash] = { object: { name, type: modes.toType(mode), body: null }, context: subtree };
          }
        } else {
          context[name] = body;
        }
      }
      let hashes = Object.keys(toLoad);
      let objects = await this.loadMany(hashes);
      if (hashes.length != objects.length) throw new Error('missing child!');
      children = [];
      for (let i=0; i < hashes.length; i++) {
        let hash = hashes[i];
        let object = objects[i];
        toLoad[hash].object.body = object.body;
        children.push(toLoad[hash]);
      }
  
      yield tree.root;
    }
  }
}

function wrapObject (object: ProjectObject): IndexRecord {
  let id = object.id;
  if (typeof id !== 'string') {
    throw new Error('invalid object id');
  }
  calculateHash(object);
  let previousHash = object._previousHash;
  let path = object._path;
  let buffer = object._buffer;
  let hash = object._hash;
  return { path, body: object, hash, buffer, previousHash };
}

function calculateHash (object: ProjectObject) {
  let type = object instanceof ProjectFolder ? 'folder' :
    object instanceof ProjectComponent ? 'components' :
    object instanceof ProjectComponentInstance ? 'instance' : null;
  if (type == null) {
    throw new Error('invalid object type')
  }
  let previousHash = object._previousHash;
  let path = type + '/' + object.id;
  let body:any = JSON.stringify(object);
  body = encoders['blob'](body);
  let buffer = frame({ type: 'blob', body });
  let hash = sha1(buffer);
  object._buffer = buffer;
  object._hash = hash;
  object._path = path;
  return object;
}
