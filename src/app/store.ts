import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import * as uuid from 'uuid/v4';
import { ProjectObject, ProjectComponent, ProjectComponentInstance, ProjectFolder } from './models';
import { encoders, decoders, frame, deframe, modes } from './util';

let constructorTableMap = {};

@Injectable()
export class Store extends Dexie {
  components: Dexie.Table<ProjectComponent, string>;
  instances: Dexie.Table<ProjectComponentInstance, string>;
  folders: Dexie.Table<ProjectFolder, string>;

  constructor() {
    super('store');
    this.version(1).stores({
      components: '_id,name',
      instances: '_id,name',
      folders: '_id,folder,name'
    });
    this.components.mapToClass(ProjectComponent);
    this.instances.mapToClass(ProjectComponentInstance);
    this.folders.mapToClass(ProjectFolder);
    constructorTableMap[ProjectComponent.name] = this.components;
    constructorTableMap[ProjectComponentInstance.name] = this.instances;
    constructorTableMap[ProjectFolder.name] = this.folders;
  }

  // start with a root object. find children at each depth level.
  async *walkTree (object: ProjectObject, parentKeyName='folder') {
    let tree = {};
    let c = object.constructor;
    let table = constructorTableMap[c.name];
    if (!table) throw new Error('incompatible object');
    let rootid = object._id;

    let children = [], parents = [];
    parents.push(rootid);
    tree[rootid] = object;
    object._children = {};

    let rootTree = tree[rootid];
    let input;
    while (true) {
      // accept id of new root to find children for
      if (input != null) {
        let { root } = input;
        if (tree[root] === undefined) {
          console.log('root', root);
          console.log('children', children, 'parents',  parents);
          console.log(await table.get({_id: root}));
          throw new Error('requested children were not loaded');
        }
        input = yield tree[root];

      } else {
        input = yield rootTree;
      }

      let root, refresh;
      // if input, get the child at input.root
      if (input != null) {
        ({ root, refresh } = input);

        // unless explicit, dont re-fetch
        if (tree[root] && !refresh) {
          continue;
        }
        let parent = await table.get({ _id: root });
        if (parent == null) throw new Error('invalid parent id');
        tree[parent._id] = parent;
        children = await table.where({ [parentKeyName]: root }).toArray();

      } else if (parents.length > 0) {
        refresh = true;
        children = await table.where(parentKeyName).anyOf(parents).toArray();
        parents = children.map(({_id}) => _id);

      } else {
        continue;
      }
  
      for (let child of children) {
        let _id = child['_id'];
        let parentId = child[parentKeyName];

        // if loading child before level has been reached (rare)
        if (!tree[parentId]) {
          tree[parentId] = { _children: {} };
        }
        // add _children to parent 
        else if (!tree[parentId]._children) {
          tree[parentId]._children = {};
        }

        // were children loaded before 
        if (tree[_id] && tree[_id]._children && !refresh) {
          child._children = tree[_id]._children;
        }

        tree[parentId]._children[_id] = tree[_id] = child;
      }
    }
  }
}
