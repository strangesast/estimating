import {
  Input,
  OnInit,
  DoCheck,
  Directive,
  OnChanges,
  TemplateRef,
  HostBinding,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';

import { CachedTree } from './cached-tree';

import { ProjectObject, ProjectFolder } from './models';

import { Store } from './store';

import { HierarchyNode, Selection } from 'd3';
import * as d3 from 'd3';

class TreeElement {
  constructor($implicit: HierarchyNode) {}
}

const elementHeight = 40;
const minimumIconWidth = 150;
const iconPadding = 10;

const treeElementSelector = '.tree-element';
 
@Directive({
  selector: '[tree][treeOf]',
})
export class TreeOf<T> {// implements OnChanges {
  @Input('treeOf') tree: HierarchyNode<ProjectFolder>;
  @Input('treeView') view: string;
  componentMap = new Map();

  constructor(private viewContainer: ViewContainerRef, private template: TemplateRef<any>) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('view' in changes) {
      this.update(this.tree, changes['view'].currentValue, changes['view'].previousValue, !changes['view'].firstChange);
    } else if ('tree' in changes) {
      this.update(this.tree, this.view);
    }
  }

  createChild(data) {
    let viewRef = this.viewContainer.createEmbeddedView(this.template, data);
    viewRef.context.$implicit = data;
    let el = viewRef.rootNodes[0];
    this.componentMap.set(el, viewRef);
    return el;
  }

  destroyChild(el) {
    let viewRef = this.componentMap.get(el);
    this.viewContainer.remove(this.viewContainer.indexOf(viewRef));
  }

  update(node, viewType, oldViewType?, animate=true) {
    if (!(node instanceof ProjectObject)) {
      throw new Error('invalid node value');
    }
    if (typeof viewType !== 'string' ||
      ['large-icons', 'icons', 'tree', 'list'].indexOf(viewType) == -1) {
      throw new Error('invalid tree type');
    }
    let self = this;
    let root;
    if (viewType == 'tree') {
      root = d3.hierarchy(node, (d) => d._children && Object.keys(d._children).map(id => d._children[id]))
    } else {
      root = d3.hierarchy(node, (d) => d == node || (d._id in node._children) ? (d._children && Object.keys(d._children).map(id => d._children[id])) : null );
    }

    // add x, y
    let treeBuilder = d3.tree().nodeSize([0, 1]);
    treeBuilder(root);

    let data = [];
    if (viewType == 'tree') {
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

    let el = this.viewContainer.element.nativeElement.parentElement;
    let { width } = el.getBoundingClientRect();
    let selection = d3.select(this.viewContainer.element.nativeElement.parentElement);
    let totalHeight = (viewType.includes('icons') ? Math.ceil(data.length / Math.floor(width / (minimumIconWidth + iconPadding))) : data.length) * ((viewType === 'icons' ? elementHeight : minimumIconWidth) + iconPadding);

    let sel = selection.style('height', totalHeight).selectAll(treeElementSelector).data(data, d => d.data._id)

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
      selection = selection.transition(t2);
      exiting.transition(t1)
        .style('top', d => {
          let par = data.find(p => d.parent.data._id == p.data._id);
          if (par) {
            return par.x*elementHeight + 'px';
          }
        })
        .on('end', function(d) {
          self.destroyChild(this);
        });
    } else {
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

    if (!viewType.includes('icons')) {
      if (animate) {
        sel.on('end', function() {
          d3.select(this).style('width', null).style('right', 0);
        });
      } else {
        sel.each(function() {
          d3.select(this).style('width', null).style('right', 0);
        });
      }
    }


    if (animate) {
      sel.on('end', function() {
        let s = d3.select(this)
        s.classed('entering', false)
          .classed('moving', false)
        if (!viewType.includes('icons')) {
          s.style('width', null).style('right', 0);
        }
      });
    } else {
      sel.classed('entering', false).classed('moving', false);
      if (!viewType.includes('icons')) {
        sel.style('width', null).style('right', 0);
      }
    }
  }
}

function style(name, selection, width) {
  switch (name) {
    case 'tree':
      selection.style('width', (d) => (width - d.y*elementHeight) + 'px')
         .style('height', `${ elementHeight+1 }px`)
         .style('top', (d) => d.x*elementHeight + 'px')
         .style('left', (d) => d.y*elementHeight + 'px');

      break;

    case 'list':
      selection.style('width', width + 'px')
         .style('height', `${ elementHeight+1 }px`)
         .style('left', 0 + 'px')
         .style('top', (d) => d.x*elementHeight + 'px')

      break;

    case 'icons':
    case 'large-icons':
      let w = Math.floor(width / (minimumIconWidth + iconPadding));
      let height = name == 'icons' ? elementHeight : minimumIconWidth;
      let aw = width / w - iconPadding*(w - 1)/w;
      selection
        .style('width', aw + 'px')
        .style('height', `${ height }px`)
        .style('top', (d, i) => Math.floor(i / w)*(height + iconPadding) + 'px')
        .style('left', (d, i) => (i % w)*(aw + iconPadding) + 'px');

      break;
  }
}
