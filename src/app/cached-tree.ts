import { ProjectObject } from './models';
import { HiearchyNode, hiearchy } from 'd3';
import Dexie from 'dexie'; 

interface IteratorResult<T> {
  done: boolean;
  value: T;
}

export class CachedTree {
  tree = {};
  private parents: string[];
  private _root: ProjectObject;
  private depth: number = -1;

  set root(root) {
    delete this.parents;
    this._root = root;
  }
  get root() {
    return this._root;
  }

  async byId(id) {
    if (this.tree[id] && this.tree[id] instanceof ProjectObject) {
      return this.tree[id];
    }
    let obj = await this.table.get({ _id: id });
    if (obj) {
      this.tree[id] = obj;
    }
    return obj;
  }

  async getPath(id, justIds=false) {
    let ids = [];

    while (id != null) {
      if (ids.indexOf(id) > -1) throw new Error('circular parent-child relationship');
      ids.push(id);
      let obj = await this.byId(id)
      if (!obj) {
        throw new Error('invalid parent reference');
      }
      id = obj[this.parentKeyName];
    }

    if (justIds) {
      return ids;
    } else {
      return ids.map(id => this.tree[id]);
    }
  }

  constructor(root: ProjectObject, private table: Dexie.Table<ProjectObject, string>, private parentKeyName='folder') {
    let rootId = root._id;
    if (!rootId) throw new Error('root must have an id');
    this.tree[rootId] = root;
    this.root = root;
  }

  public async next(input?: { root: string, refresh: boolean }): Promise<IteratorResult<HiearchyNode>> {
    let { table, tree, parents, parentKeyName, depth } = this;
    let refresh = false, rootId = this.root._id, children, done = false, value;

    if (input) {
      ({ refresh, root: rootId } = input);
      if (typeof rootId !== 'string') {
        throw new Error('root must be a string');
      }
      parents = null;
      // get requested root from cache
      if (rootId && !refresh && tree[rootId]) {
        return tree[rootId]
      }
    }

    // root is either specified by input or it's the first go
    if (!parents) {
      children = await table.where({ [parentKeyName]: rootId }).toArray();
    }
    // children found in last go-round
    else if (parents.length > 0) {
      children = await table.where(parentKeyName).anyOf(parents).toArray();
    }
    // no more children to be had
    else {
      children = [];
      done = true;
    }
    depth++;

    let nextParents = [];
    for (let child of children) {
      let { _id } = child;
      let parentId = child[parentKeyName];
      if (parents && parents.indexOf(parentId) > -1) {
        parents.splice(parents.indexOf(parentId), 1);
      }

      // specified as root
      if (!tree[parentId]) {
        tree[parentId] = { _children: {} };

      // added as a child, children hadn't been searched
      } else if (!tree[parentId]._children) {
        tree[parentId]._children = {};
      }

      let existing = tree[_id] && tree[_id]._children;
      if (existing && !refresh) {
        child._children = existing;
      }

      tree[parentId]._children[_id] = tree[_id] = child;
      nextParents.push(_id);
    }
    // any parents without children still get ._children
    if (parents && parents.length) {
      for (let id of parents) {
        tree[id]._children = tree[id]._children || {};
      }
    }
    this.parents = nextParents;

    value = { node: tree[rootId], depth };

    return { value, done };
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<HiearchyNode> {
    return this;
  }
}
