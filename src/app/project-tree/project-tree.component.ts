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
export class ProjectTreeComponent implements OnInit, AfterViewInit {
  @ViewChild('tree') tree
  treeValue: any;
  activeChild: string = null;
  ngUnsubscribe: Subject<boolean> = new Subject();

  constructor(private project: ProjectTreeService, private store: Store, private route: ActivatedRoute) { }

  ngOnInit() {
    this.project.buildingFolders.takeUntil(this.ngUnsubscribe).subscribe(vals => this.treeValue = vals);

    this.route.params.subscribe(() => console.log('params'));

    this.project.activeChild.subscribe(child => this.activeChild = child);
  }

  ngAfterViewInit() {
    //console.log(d3.select(this.tree.nativeElement));
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  clicked(d) {
    if (!(d instanceof d3.hierarchy)) {
      throw new Error('invalid type');
    }
    console.log(d);
  }
}
