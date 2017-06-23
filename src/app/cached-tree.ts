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
  private depth: -1;

  set root(root) {
    delete this.parents;
    this._root = root;
  }
  get root() {
    return this._root;
  }

  constructor(root: ProjectObject, private table: Dexie.Table<ProjectObject, string>, private parentKeyName='folder') {
    this.root = root;
  }

  public async next(input?: { root: string, refresh: boolean }): Promise<IteratorResult<HiearchyNode>> {
    let { table, tree, parents, parentKeyName, depth } = this;
    let refresh = false, root = this.root._id, children, done = false, value;

    if (input) {
      ({ refresh, root } = input);
      parents = null;
      // get requested root from cache
      if (root && !refresh && tree[root]) {
        return tree[root]
      }
    }

    // root is either specified by input or it's the first go
    if (!parents) {
      children = await table.where({ [parentKeyName]: root }).toArray();
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

    value = { node: tree[root], depth };

    return { value, done };
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<HiearchyNode> {
    return this;
  }
}
