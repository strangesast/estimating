import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.less'],
  host: {
    '[class.side]': 'side'
  }
})
export class ProjectComponent implements OnInit {
  title = 'Project';
  side: boolean = true;

  constructor() { }

  ngOnInit() {
  }

}
