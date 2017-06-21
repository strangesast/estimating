import { ViewChild, Component, OnInit, ComponentFactoryResolver, AfterViewInit } from '@angular/core';
import * as uuid from 'uuid/v4';
import { ProjectFolder } from '../models';
import { Store } from '../store';
import * as d3 from 'd3';

@Component({
  selector: 'app-project-tree',
  templateUrl: './project-tree.component.html',
  styleUrls: ['./project-tree.component.less']
})
export class ProjectTreeComponent implements OnInit, AfterViewInit {
  @ViewChild('tree') tree

  constructor(private store: Store) { }

  ngOnInit() {
    let root = new ProjectFolder({ type: 'building', name: 'root', folder: null, _id: uuid() });
    let folders = [root];
    
    for (let i=0; i < 10; i++) {
      let j = Math.floor(Math.random()*folders.length);
      let parent = folders[j];
      let folder = new ProjectFolder({ type: 'building', folder: parent._id, name: `Folder ${ i+1 }`, _id: uuid() });
      folders.push(folder);
    }

    (async () => {
      await this.store.folders.clear();
      await this.store.folders.bulkAdd(folders);
      let gen = this.store.walkTree(root);

      let val;
      val = (await gen.next()).value;
      val = (await gen.next()).value;
      let i = Math.floor(Math.random()*folders.length);
      let one = folders[i]._id;
      console.log('i', i);
      //await gen.next(one);
      val = (await gen.next({ root: one, refresh: false })).value;
      console.log('one', one, val);
    })();
  }

  ngAfterViewInit() {
    //console.log(d3.select(this.tree.nativeElement));
  }
}
