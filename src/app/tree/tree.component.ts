import { ComponentFactory, SimpleChanges, OnChanges, ViewContainerRef, ComponentFactoryResolver, Input, Component, OnInit } from '@angular/core';
import { CachedTree } from '../cached-tree';
import { TreeElementComponent, treeElementSelector } from '../tree-element/tree-element.component';
import { TreeService } from '../tree.service';

import { ProjectFolder } from '../models';

import { Store } from '../store';

import { HiearchyNode, Selection } from 'd3';
import * as d3 from 'd3';

let elementHeight = 40;
 
// handle opening / closing 
@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.less'],
  host: {
    '[class]': 'viewType'
  }
})
export class TreeComponent implements OnInit, OnChanges {

  @Input('view') set viewType(type) {
    this.tree.viewType = type;
  }

  get viewType() {
    return this.tree.viewType;
  }


  _componentFactory: ComponentFactory<TreeElementComponent>;
  selection: Selection;

  // viewtypes
  //   list
  //     vertical list, one folder depth at a time
  //   tree
  //     indented list, multiple depths
  //   icons, large-icons
  //     arranged squares

  constructor(private _componentFactoryResolver: ComponentFactoryResolver, private _viewContainer: ViewContainerRef, private tree: TreeService) { }

  async ngOnInit() {
    this._componentFactory = this._componentFactoryResolver.resolveComponentFactory(TreeElementComponent);

    if (!this.tree.ready) {
      await this.tree.init();
    }
    let data = this.tree.calculate();

    this.selection = d3.select(this._viewContainer.element.nativeElement);
    this.update(data, this.viewType);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.tree.ready || !this.selection) return;
    if ('viewType' in changes) {
      let data = this.tree.calculate();
      this.update(data, changes['viewType'].currentValue, changes['viewType'].previousValue);
    }
  }

  createChild(data) {
    let componentRef = this._viewContainer.createComponent(this._componentFactory);
    data._component = componentRef;
    Object.assign((<TreeElementComponent>componentRef.instance), data);
    return componentRef.location.nativeElement;
  }

  update(data, viewType, oldViewType?) {
    let viewContainer = this._viewContainer;
    let el = viewContainer.element.nativeElement;
    let { width } = el.getBoundingClientRect();

    let sel = this.selection.selectAll(treeElementSelector).data(data, d => d.data._id)

    let enter = sel.enter().append(d => this.createChild(d))

    let t1 = d3.transition().duration(500);
    let t2 = d3.transition().duration(500);

    sel.exit()
      .classed('exiting', true)
      .transition(t1)
      .style('transform', d => {
        let par = data.find(p => d.parent.data._id == p.data._id);
        if (par) {
          return 'translate(' + d.y*elementHeight + 'px,' + par.x*elementHeight + 'px)';
        }
      })
      .on('end', function(d, i) {
        viewContainer.remove(viewContainer.indexOf(d._component));
      });


    enter
      .classed('entering', true)
      .transition(t2)
      .each(d => {
        let par = data.find(p => d.parent.data._id == p.data._id);
        if (par) {
          d.parent = par;
        }
      })
      .style('width', (d) => (width - d.parent.y*elementHeight) + 'px')
      .style('transform', (d) => 'translate(' + d.y*elementHeight + 'px,' + d.parent.x*elementHeight + 'px)');

    sel = enter.merge(sel)

    let stream = sel;
    if (swap(viewType, oldViewType)) {
    //if (oldViewType == 'large-icons' || oldViewType == 'icons' || oldViewType == 'tree') {
      stream = stream.transition(t1)
        .style('width', width + 'px')
        .style('height', `${ elementHeight+1 }px`)
        .style('transform', (d) => 'translate(0px,' + d.x*elementHeight + 'px)')
    }

    if (viewType == 'tree') {
      stream = stream.transition(t2)
        .style('width', (d) => (width - d.y*elementHeight) + 'px')
        .style('height', `${ elementHeight+1 }px`)
        .style('transform', (d) => 'translate(' + d.y*elementHeight + 'px,' + d.x*elementHeight + 'px)')
      this.selection.transition(t2).style('height', data.length*elementHeight + 'px');

    }

    if (viewType == 'list') {
      stream = stream.transition(t2)
        .style('width', width + 'px')
        .style('height', `${ elementHeight+1 }px`)
        .style('transform', (d) => 'translate(0px,' + d.x*elementHeight + 'px)')
      this.selection.transition(t1).style('height', data.length*elementHeight + 'px');

    }

    if (viewType == 'icons') {
      let w = Math.floor(width / 150);
      stream = stream.transition(t2)
        .style('width', '140px')
        .style('height', `${ elementHeight+1 }px`)
        .style('transform', (d, i) => `translate(${ (i % w)*150 }px, ${ Math.floor(i / w)*50 }px)`);
      this.selection.transition(t2).style('height', data.length*elementHeight + 'px');
    }

    if (viewType == 'large-icons') {
      let w = Math.floor(width / 150);
      stream = stream.transition(t2)
        .style('width', '140px')
        .style('height', '140px')
        .style('transform', (d, i) => `translate(${ (i % w)*150 }px, ${ Math.floor(i / w)*150 }px)`);
      this.selection.transition(t2).style('height', data.length*elementHeight + 'px');
    }

    stream.on('end', function() { d3.select(this).classed('entering', false) });
  }
}

function swap(a, b) {
  if (!a || !b) return false;
  if (a == 'list' || b == 'list') return false;
  return (a.includes('icon') && !b.includes('icon')) || (!a.includes('icon') && b.includes('icon'))
}
