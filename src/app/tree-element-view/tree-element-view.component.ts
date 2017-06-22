import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '../store';
import { ProjectTreeService } from '../project-tree.service';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-tree-element-view',
  templateUrl: './tree-element-view.component.html',
  styleUrls: ['./tree-element-view.component.less']
})
export class TreeElementViewComponent implements OnInit {
  data
  ngUnsubscribe: Subject<boolean> = new Subject();

  constructor(private route: ActivatedRoute, private store: Store, private router: Router, private project: ProjectTreeService) { }

  ngOnInit() {
    this.route.params.takeUntil(this.ngUnsubscribe).flatMap(async({ type, id }) => {
      let tableName = type + 's';
      let element = await this.store[tableName].get({ _id: id });
      if (!element) {
        this.router.navigateByUrl('/project/tree');
        return Observable.never();
      }
      this.project.activeChild.next(id);
      return element;
    }).subscribe(data => this.data = data);
  }

  ngOnDestroy() {
    this.project.activeChild.next(null);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
