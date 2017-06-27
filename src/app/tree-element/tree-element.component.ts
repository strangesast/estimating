import { HostListener, Input, Component, OnInit } from '@angular/core';
import { TreeService } from '../tree.service';

export const treeElementSelector = 'app-tree-element';

@Component({
  selector: treeElementSelector,
  templateUrl: './tree-element.component.html',
  styleUrls: ['./tree-element.component.less'],
  host: {
    'tabindex': '1',
    'draggable': 'true'
  }
})
export class TreeElementComponent implements OnInit {
  @Input() data: string = 'no name';
  @Input() depth: number;
  @Input() height: number;
  @Input() children: any[];

  draggedOver: boolean = false;

  @HostListener('dragstart', ['$event']) dragdrop(e) {
    console.log('start');
  }

  @HostListener('dragenter', ['$event']) dragenter(e) {
    this.draggedOver = true;
  }

  @HostListener('dragleave', ['$event']) dragleave(e) {
    this.draggedOver = false;
  }


  constructor(public tree: TreeService) { }

  ngOnInit() {}

  @HostListener('dblclick') dblClick() {
    this.tree.open(this.data);
  }
}
