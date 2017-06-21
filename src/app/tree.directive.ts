import { Input, Directive } from '@angular/core';

@Directive({
  selector: '[appTree]'
})
export class TreeDirective {
  @Input('tree') tree: any[];

  constructor() { }

}
