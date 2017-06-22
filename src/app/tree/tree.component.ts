import { Input, Component, OnInit } from '@angular/core';
import { HiearchyNode } from 'd3';
 
// handle opening / closing 
@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.less']
})
export class TreeComponent implements OnInit {
  @Input('node') rootNode: HiearchyNode;

  constructor() { }

  ngOnInit() {
  }

}
