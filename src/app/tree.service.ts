import { Injectable } from '@angular/core';
import { tree, hierarchy } from 'd3';
import { CachedTree } from './cached-tree';
import { Store } from './store';
import * as uuid from 'uuid/v4';
import { ProjectFolder, ProjectObject } from './models';

@Injectable()
export class TreeService {
  viewType: string;
  cachedTree: CachedTree;

  path: ProjectObject[];
  activePathIndex = -1;

  get ready(): boolean {
    return !!this.cachedTree;
  }

  constructor(private store: Store) { }

  async init(): Promise<void> {
    let root = new ProjectFolder({ type: 'building', name: 'root', folder: null, _id: uuid() });
    let folders = [root];
    
    for (let i=0; i < 2000; i++) {
      let j = Math.floor(Math.random()*folders.length);
      let parent = folders[j];
      let folder = new ProjectFolder({ type: 'building', folder: parent._id, name: `Folder ${ i+1 }`, _id: uuid() });
      folders.push(folder);
    }

    await this.store.folders.clear();
    await this.store.folders.bulkAdd(folders);

    this.cachedTree = new CachedTree(root, this.store.folders);
    let res;
    res = await this.cachedTree.next();
    res = await this.cachedTree.next();

  }

  calculate() {
    let treeBuilder = tree().nodeSize([0, 1]);
    let root = hierarchy(this.cachedTree.root, (d) => d._children && Object.keys(d._children).map(id => d._children[id]))
    let node = treeBuilder(root);
    let data = [];
    if (this.viewType == 'tree') {
      node.eachBefore(n => {
        if (n !== node) {
          data.push(n);
        }
      });
      data.forEach((d, i) => {
        d.y = d.y - 1;
        d.x = i;
      });
    } else {
      for (let i=0; i<node.children.length; i++) {
        let child = node.children[i];
        child.x = i;
        child.y = 0;
        data.push(child);
      }
    }
    return data;
  }

  async updateRoot(rootId) {
  }

  async updatePath(rootId) {
    this.path = await this.cachedTree.getPath(rootId);
    this.activePathIndex = this.path.length - 1;
  }

  open(element) {
    console.log(element);
  }
}
