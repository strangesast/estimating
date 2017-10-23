import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../project.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.less'],
})
export class ProjectComponent implements OnInit {
  title = 'Project';
  history = [];
  _historyIndex = -1;
  set historyIndex(val) {
    this.project.historyIndex.next(val);
    this._historyIndex = val;
  }
  get historyIndex() {
    return this._historyIndex;
  }
  ngUnsubscribe: Subject<boolean> = new Subject();

  constructor(private project: ProjectService) { }

  ngOnInit() {
    this.historyIndex = 0;
    this.project.history.takeUntil(this.ngUnsubscribe).subscribe(history => this.history = history);
    this.project.historyIndex.takeUntil(this.ngUnsubscribe).subscribe(historyIndex => this._historyIndex = historyIndex);
  }

  changeHistory(index) {
    this.historyIndex = Math.min(Math.max(index, 0), this.history.length - 1);
  }
}
