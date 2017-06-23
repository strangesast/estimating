import { Input, Component, OnInit } from '@angular/core';
import { TreeService } from '../tree.service';

export const treeElementSelector = 'app-tree-element';

@Component({
  selector: treeElementSelector,
  templateUrl: './tree-element.component.html',
  styleUrls: ['./tree-element.component.less'],
  host: {
    'tabindex': '1'
  }
})
export class TreeElementComponent implements OnInit {
  @Input() data: string = 'no name';
  @Input() depth: number;
  @Input() height: number;
  @Input() children: any[];

  constructor(private tree: TreeService) { }

  ngOnInit() {}

}
