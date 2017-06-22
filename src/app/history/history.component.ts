import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.less']
})
export class HistoryComponent implements OnInit {
  history = [];
  historyIndex: number = -1;

  lastCommit;

  constructor(private project: ProjectService) { }

  ngOnInit() {
    this.project.history.subscribe(hist => this.history = hist);
    this.project.historyIndex.subscribe(index => this.historyIndex = index);

    let date = new Date();
    date.setDate(date.getDate() - 10);

    this.lastCommit = {
      description: 'Last commit',
      date,
      changes: [],
      index: 0
    }
  }

}
