import { ComponentFactory, SimpleChanges, OnChanges, ViewContainerRef, ComponentFactoryResolver, Input, Component, OnInit } from '@angular/core';
import { CachedTree } from '../cached-tree';
import { TreeElementComponent, treeElementSelector } from '../tree-element/tree-element.component';
import { TreeService } from '../tree.service';

import { ProjectFolder } from '../models';

import { Store } from '../store';

import { HiearchyNode, Selection } from 'd3';
import * as d3 from 'd3';

const elementHeight = 40;
const minimumIconWidth = 150;
const iconPadding = 10;
 
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

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainer: ViewContainerRef,
    private tree: TreeService
  ) { }

  async ngOnInit() {
    this._componentFactory = this._componentFactoryResolver.resolveComponentFactory(TreeElementComponent);

    if (!this.tree.ready) {
      await this.tree.init();
    }
    this.selection = d3.select(this._viewContainer.element.nativeElement);
    this.update(this.tree.cachedTree.root, this.viewType, null, false);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.tree.ready || !this.selection) return;
    if ('viewType' in changes) {
      this.update(this.tree.cachedTree.root, changes['viewType'].currentValue, changes['viewType'].previousValue);
    }
  }

  createChild(data) {
    let componentRef = this._viewContainer.createComponent(this._componentFactory);
    data._component = componentRef;
    Object.assign((<TreeElementComponent>componentRef.instance), data);
    return componentRef.location.nativeElement;
  }

  destroyChild(view) {
    this._viewContainer.remove(this._viewContainer.indexOf(view));
  }

  treeBuilder = d3.tree().nodeSize([0, 1]);

  update(node, viewType, oldViewType?, animate=true) {
    let root;
    if (viewType == 'tree') {
      root = d3.hierarchy(node, (d) => d._children && Object.keys(d._children).map(id => d._children[id]))
    } else {
      root = d3.hierarchy(node, (d) => d == node || (d._id in node._children) ? (d._children && Object.keys(d._children).map(id => d._children[id])) : null );
    }

    // add x, y
    this.treeBuilder(root);

    let data = [];
    if (this.viewType == 'tree') {
      root.eachBefore(n => {
        if (n !== root) {
          data.push(n);
        }
      });
      data.forEach((d, i) => {
        d.y = d.y - 1;
        d.x = i;
      });
    } else {
      for (let i=0; i<root.children.length; i++) {
        let child = root.children[i];
        child.x = i;
        child.y = 0;
        data.push(child);
      }
    }

    let { width } = this.selection.node().getBoundingClientRect();
    let sel = this.selection.selectAll(treeElementSelector).data(data, d => d.data._id)

    let t1 = d3.transition().duration(500);
    let t2 = d3.transition().duration(500);

    let exiting = sel.exit()
      .classed('exiting', true)

    let entering = sel.enter()
      .append(d => this.createChild(d))

    entering
      .each(d => {
        let par = data.find(p => d.parent.data._id == p.data._id);
        if (par) {
          d.parent = par;
        }
      })

    entering
      .classed('entering', true)//.transition(t2)
      .style('width', (d) => (width - d.y*elementHeight) + 'px')
      .style('top', (d) => d.parent.x*elementHeight + 'px')
      .style('left', (d) => d.y*elementHeight + 'px');

    if (animate) {
      this.selection.transition(t2).style('height', data.length*elementHeight + 'px');
      exiting.transition(t1)
        .style('top', d => {
          let par = data.find(p => d.parent.data._id == p.data._id);
          if (par) {
            return par.x*elementHeight + 'px';
          }
        })
        .on('end', d => {
          this.destroyChild(d._component);
        });
    } else {
      this.selection.style('height', data.length*elementHeight + 'px');
      exiting.each(d => {
        this.destroyChild(d._component);
      });
    }


    sel = entering.merge(sel).classed('moving', true);

    if (oldViewType && viewType && (
      (oldViewType.includes('icons') && viewType == 'tree') ||
      (oldViewType == 'tree' && viewType.includes('icons')))) {
      if (animate) {
        sel = sel.transition(t1)
      }
      style('list', sel, width);
    }

    if (animate) {
      sel = sel.transition(t2)
    }

    style(viewType, sel, width);

    if (animate) {
      sel.on('end', function() {
        d3.select(this)
          .classed('entering', false)
          .classed('moving', false)
      });
    } else {
      sel.classed('entering', false).classed('moving', false);
    }
  }
}

function style(name, sel, width) {
  switch (name) {
    case 'tree':
      sel.style('width', (d) => (width - d.y*elementHeight) + 'px')
         .style('height', `${ elementHeight+1 }px`)
         .style('top', (d) => d.x*elementHeight + 'px')
         .style('left', (d) => d.y*elementHeight + 'px');

      break;

    case 'list':
      sel.style('width', width + 'px')
         .style('height', `${ elementHeight+1 }px`)
         .style('left', 0 + 'px')
         .style('top', (d) => d.x*elementHeight + 'px')

      break;

    case 'icons':
    case 'large-icons':
      let w = Math.floor(width / (minimumIconWidth + iconPadding));
      let height = name == 'icons' ? elementHeight : minimumIconWidth;
      let aw = width / w - iconPadding*(w - 1)/w;
      sel.style('width', aw + 'px')
         .style('height', `${ height }px`)
         .style('top', (d, i) => Math.floor(i / w)*(height + iconPadding) + 'px')
         .style('left', (d, i) => (i % w)*(aw + iconPadding) + 'px');

      break;
  }
}
