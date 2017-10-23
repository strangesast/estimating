import { Injectable, SimpleChanges } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { Store } from './store';
import * as uuid from 'uuid/v4';
import { ProjectFolder } from './models';
import * as d3 from 'd3';

import { CachedTree } from './cached-tree';

let testHistory = [];

for (let i = 0; i < 10; i++) {
  let date = new Date();
  date.setDate(date.getDate()-i);
  testHistory.push({
    description: `Sommething happened ${ i+1 }.`,
    date,
    changes: [],
    index: i
  });
}
interface HistoryState {
  index: number;
  description: string;
  changes?: any[];
  diff?: any;
}

@Injectable()
export class ProjectService implements Resolve<any> {
  constructor(private store: Store) { }

  history: BehaviorSubject<HistoryState[]> = new BehaviorSubject(testHistory);
  historyIndex: BehaviorSubject<number> = new BehaviorSubject(0);

  private _buildingFolders;
  buildingFolders: BehaviorSubject<ProjectFolder[]> = new BehaviorSubject([]);

  cachedTree;

  async init() {
    /*
    let root = new ProjectFolder({ type: 'building', name: 'root', folder: null, _id: uuid() });
    let folders = [root];
    
    for (let i=0; i < 20; i++) {
      let j = Math.floor(Math.random()*folders.length);
      let parent = folders[j];
      let folder = new ProjectFolder({ type: 'building', folder: parent._id, name: `Folder ${ i+1 }`, _id: uuid() });
      folders.push(folder);
    }

    await this.store.folders.clear();
    await this.store.folders.bulkAdd(folders);

    let gen = new CachedTree(root, this.store.folders);
    this.cachedTree =gen;

    let val;
    val = (await gen.next()).value;
    val = (await gen.next()).value;
    console.log('val', val);
    //for await (val of gen) {
    //}

    let tree = d3.tree().nodeSize([0, 1]);
    let node = tree(d3.hierarchy(val.node, (d) => d._children && Object.keys(d._children).map(id => d._children[id])));
    console.log(node);

    this.buildingFolders.next(node);
    return this.buildingFolders;
    */
    return Promise.resolve();

    //val = (await gen.next()).value;
    //val = (await gen.next()).value;
    //val = (await gen.next()).value;
    //val = (await gen.next()).value;
    //val = (await gen.next()).value;


    //this._buildingFolders = this.store.walkTree(root);

    //let val;
    //val = (await this._buildingFolders.next()).value;
    //val = (await this._buildingFolders.next()).value;
    //val = (await this._buildingFolders.next()).value;

    //val = (await this._buildingFolders.next()).value;
    //val = (await this._buildingFolders.next()).value;
    //val = (await this._buildingFolders.next()).value;
    //val = (await this._buildingFolders.next()).value;
    //val = (await this._buildingFolders.next()).value;
    //val = (await this._buildingFolders.next()).value;

    //let tree = d3.tree().nodeSize([0, 1]);
    //let node = tree(d3.hierarchy(val, (d) => d._children && Object.keys(d._children).map(id => d._children[id])));

    //let data = [];
    //node.eachBefore(function(n) {
    //  if (n !== node) {
    //    data.push(n);
    //  }
    //});

    //data.forEach((d, i) => {
    //  d.y = d.y - 1;
    //  d.x = i;
    //});

    //this.buildingFolders.next(node);
    //return this.buildingFolders;

    //let i = Math.floor(Math.random()*folders.length);
    //let one = folders[i]._id;
    //console.log('i', i);
    ////await gen.next(one);
    //val = (await gen.next({ root: one, refresh: false })).value;
    //console.log('one', one, val);
  }

  resolve() {
    return this.init();
  }
}
