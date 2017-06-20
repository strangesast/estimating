import { IPerson, Person, Commit, Tree, Tag, ObjectRecord, RefRecord, IndexRecord } from './models';

/*
export class GitStore extends IDBStore {

  async getObject(type: string, hash: string): Promise<Commit|Tree|Tag|Blob> {
    let { type: _type, body, buffer } = await this.getRawObject(hash);
    if (type !== _type) {
      throw new Error('inconsistent type');
    }
    if (body) {
      return body;
    }
    body = decoders[type](buffer);
    await this.setRawObject({ type, body, buffer, hash });
    return body;
  }

  async encodeOne(el, save=true) {
    if (!el) {
      throw new Error('invalid object');
    }
    let type = el.type;
    let encoder = encoders[type];
    if (!encoder) {
      throw new Error('invalid type');
    }
    el.buffer =  encoder(el.body);
    el.hash = sha1(el.buffer);
    if (save) {
      await this.setRawObject(el);
    }
    return el;
  }

  async encodeMany(arr) {
    let toEncode = arr.filter(obj => !obj.buffer);
    if (toEncode.length) {
      toEncode.forEach(obj => this.encodeOne(obj, false));
      await this.setManyRawObjects(toEncode);
    }
    return arr;
  }

  async getManyRawObjects(hashes: string[], save=true): Promise<any[]> {
    let results = await this.getMany('objects', hashes);
    if (save) {
      await this.encodeMany(results);
    }
    return results;
  }

  async getManyObjects(type: string, hashes: string[], save=true): Promise<any[]> {
    let encoder = encoders[type];
    if (typeof encoder !== 'function') {
      throw new Error('invalid type');
    }
    let result = await this.getManyRawObjects(hashes, save);
    if (!result.every(({ type: _type }) => _type === type)) {
      throw new Error('inconsistent type in result');
    }
    return result;
  }

  async getRawObject(hash: string): Promise<ObjectRecord> {
    let result = await this.get('objects', hash) as ObjectRecord;
    return result;
  }

  async setManyObjects(type: string, objects, normalize=true): Promise<string[]> {
    let encoder = encoders[type];
    let normalizer = normalizers[type];
    if (!encoder) {
      throw new Error('invalid type');
    }
    let raw = objects.map(body => {
      if (normalize && normalizer) {
        body = normalizer(body);
      }
      let buffer = encoder(body);
      let hash = sha1(buffer);
      return { type, body, buffer, hash };
    });
    await this.setManyRawObjects(raw);
    return raw.map(({ hash }) => hash);
  }

  async setManyRawObjects(objects) {
    await this.setMany('objects', objects);
    return;
  }

  async setObject(type: string, body: any, normalize=true): Promise<string> {
    let encoder = encoders[type];
    let normalizer = normalizers[type];
    if (normalize && normalizer) {
      body = normalizer(body);
    }
    if (typeof encoder !== 'function') {
      throw new Error('invalid type');
    }
    let buffer = encoder(body);
    let hash = sha1(buffer);
    await this.setRawObject({ type, body, buffer, hash });
    return hash;
  }

  async setRawObject(obj): Promise<void> {
    let result = await this.set('objects', obj);
    return;
  }

  async hasObjectHash(hash): Promise<boolean> {
    let result = await this.get('objects', hash);
    return !!result;
  }

  async clearObjects() {}

  async getRef(ref: string): Promise<RefRecord> {
    let result = await this.get('refs', ref) as RefRecord;
    return result;
  }

  async setRef(obj): Promise<void> {
    let result = await this.set('refs', obj);
    return;
  }

  async getIndexRecord(path: string): Promise<IndexRecord> {
    let result = await this.get('index', path) as IndexRecord;
    return result;
  }

  async setIndexRecord(obj): Promise<void> {
    let result = await this.get('index', obj.path);
    if (result) {

    }
    result = await this.set('index', obj);
    return;
  }
}

export const normalizers = {
  commit: normalizeCommit,
  tag: normalizeTag,
  tree: normalizeTree
}

function normalizeCommit(body) {
  if (!body || typeof body !== 'object') {
    throw new TypeError('Commit body must be an object');
  }
  if (!(body.tree && body.author && body.message)) {
    throw new TypeError('Tree, author, and message are required for commits');
  }
  var parents = body.parents || (body.parent ? [ body.parent ] : []);
  if (!Array.isArray(parents)) {
    throw new TypeError('Parents must be an array');
  }
  var author = normalizePerson(body.author);
  var committer = body.committer ? normalizePerson(body.committer) : author;
  return {
    tree: body.tree,
    parents: parents,
    author: author,
    committer: committer,
    message: body.message
  };
}

function normalizeTag(body) {
  if (!body || typeof body !== 'object') {
    throw new TypeError('Tag body must be an object');
  }
  if (!(body.object && body.type && body.tag && body.tagger && body.message)) {
    throw new TypeError('Object, type, tag, tagger, and message required');
  }
  return {
    object: body.object,
    type: body.type,
    tag: body.tag,
    tagger: normalizePerson(body.tagger),
    message: body.message
  };
}

function normalizeTree(body) {
  var type = body && typeof body;
  if (type !== 'object') {
    throw new TypeError('Tree body must be array or object');
  }
  var tree = {}, i, l, entry;
  // If array form is passed in, convert to object form.
  if (Array.isArray(body)) {
    for (i = 0, l = body.length; i < l; i++) {
      entry = body[i];
      tree[entry.name] = {
        mode: entry.mode,
        hash: entry.hash
      };
    }
  }
  else {
    var names = Object.keys(body);
    for (i = 0, l = names.length; i < l; i++) {
      var name = names[i];
      entry = body[name];
      tree[name] = {
        mode: entry.mode,
        hash: entry.hash
      };
    }
  }
  return tree;
}

function normalizePerson(person) {
  if (!person || typeof person !== 'object') {
    throw new TypeError('Person must be an object');
  }
  if (typeof person.name !== 'string' || typeof person.email !== 'string') {
    throw new TypeError('Name and email are required for person fields');
  }
  return {
    name: person.name,
    email: person.email,
    date: person.date || new Date()
  };
}


*/
