import { ViewChild, Component, OnInit, ComponentFactoryResolver, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as uuid from 'uuid/v4';
import { Subject } from 'rxjs';
import { ProjectFolder } from '../models';
import { ProjectTreeService } from '../project-tree.service';
import { Store } from '../store';
import * as d3 from 'd3';

@Component({ selector: 'app-project-tree',
  templateUrl: './project-tree.component.html',
  styleUrls: ['./project-tree.component.less']
})
export class ProjectTreeComponent {
  ngUnsubscribe: Subject<boolean> = new Subject();

  cachedTree;
  tree: d3.HierarchyNode;
  treeUpdates = new Subject<any>();

  view = 'list';
  viewToClass = {
    list: 'fa-th-list',
    icons: 'fa-th',
    'large-icons': 'fa-th-large',
    tree: 'fa-align-left fa-flip-vertical'
  }

  setView(view) {
    this.view = view;
  }

  //path = ['root', 'folder 1', 'folder 2', 'folder 3'];
  path = ['root'];
  pathIndex = 3;

  setPathIndex(i) {
    this.pathIndex = i;
  }

  constructor(private project: ProjectTreeService, private store: Store, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(() => console.log('params'));
    this.tree = this.project.cachedTree.root;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  async setRoot(node) {
    this.path = await this.project.cachedTree.getPath(node._id);
    this.tree = node;
  }
  
  dblclicked(node) {
    this.setRoot(node.data);
  }

  clicked(d) {
    if (!(d instanceof d3.hierarchy)) {
      throw new Error('invalid type');
    }
  }

  dragstart(tree) {
  }

  toggleChildren(node) {
    node.data._open = !node.data._open;
    this.treeUpdates.next();
  }
}
