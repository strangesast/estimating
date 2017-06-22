import { Input, Directive, OnChanges, SimpleChanges, EmbeddedViewRef, ViewContainerRef, TemplateRef } from '@angular/core';
import { select, HierarchyNode } from 'd3';

interface TreeNode {
  data: any;
  index?: number;
  count?: number;
  depth: number;
  height: number;
  parent: TreeNode;
  children?: TreeNode[];
  value?: any;
  $implicit: any;
  x?: number;
  y?: number;
}

class TreeRow implements TreeNode {
  data: any;
  index?: number;
  count?: number;
  depth: number;
  height: number;
  parent: TreeNode;
  children?: TreeNode[];
  value?: any;
  $implicit: any;
  x?: number;
  y?: number;

  constructor(node: Partial<TreeNode>) {
    Object.assign(this, node);
  }
}

@Directive({
  selector: '[appTree]'
})
export class TreeDirective implements OnChanges {
  @Input('appTreeOf') tree: HierarchyNode;

  constructor(private _viewContainer: ViewContainerRef, private _template: TemplateRef<TreeRow>) {}

  ngOnChanges(changes: SimpleChanges) {
    console.log('dir changes');
    if ('tree' in changes) {
      const value = changes['tree'].currentValue;
      //if (!Array.isArray(value)) {
      //  throw new Error('invalid tree value');
      //}
      this._applyValue(value);
    }
  }

  private _applyValue(data) {
    let node = data;
    data = [];
    node.eachBefore(function(n) {
      if (n !== node) {
        data.push(n);
      }
    });
  
    data.forEach((d, i) => {
      d.y = d.y - 1;
      d.x = i;
    });

    let el = this._viewContainer.element.nativeElement.parentElement
    let sel = select(el);
    let height = 40;
    sel.style('height', data.length*height + 'px');
    let tree = sel.selectAll('[node]').data(data, (d) => d);

    let container = this._viewContainer;
    let template = this._template;

    tree.exit().each(function(d, i) {
      container.remove(i);
    });

    tree.each(function(d, i) {
      const viewRef = <EmbeddedViewRef<TreeRow>>container.get(i);
      viewRef.context.$implicit = d;
      select(viewRef.rootNodes[0]).attr('transform', 'translate(0, ' + d.x*(height-1) + ')');
    });

    tree.enter().append(function(d, i) {
      let viewRef = container.createEmbeddedView(template, new TreeRow(d));
      viewRef.context.$implicit = d;
      select(viewRef.rootNodes[0]).style('transform', 'translate(0, ' + (d.x*(height-1)) + 'px)');
      let _el = viewRef.rootNodes[0];
      if (!_el) throw Error('invalid template');
      _el.setAttribute('node', '');
      return _el;
    });

    tree.sort();

    for (let i = 0, len = container.length; i < len; i++) {
      const viewRef = <EmbeddedViewRef<TreeRow>>container.get(i);
      viewRef.context.index = i;
      viewRef.context.count = len;
    }
  }

}
