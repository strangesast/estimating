import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  host: {
    '[class.side]': 'side'
  }
})
export class DashboardComponent implements OnInit {
  side: boolean = true;

  constructor() { }

  ngOnInit() {
  }

}
