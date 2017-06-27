import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ProjectService } from './project.service';
import { BehaviorSubject } from 'rxjs';
import { ProjectFolder, ProjectObject } from './models';
import { CachedTree } from './cached-tree';
import { Store } from './store';
import * as uuid from 'uuid/v4';

@Injectable()
export class ProjectTreeService implements Resolve<any> {
  buildingFolders: BehaviorSubject<any>;
  activeChild: BehaviorSubject<string> = new BehaviorSubject(null);
  cachedTree: CachedTree;

  path: ProjectObject[];
  activePathIndex = -1;

  async updatePath(rootId) {
    this.path = await this.cachedTree.getPath(rootId);
    this.activePathIndex = this.path.length - 1;
  }

  constructor(private store: Store, private project: ProjectService) { }

  resolve() {
    return this.init();
  }

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


}
