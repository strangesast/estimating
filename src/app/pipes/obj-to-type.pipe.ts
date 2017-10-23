import { Pipe, PipeTransform } from '@angular/core';
import { ProjectFolder, ProjectComponent, ProjectComponentInstance } from './models';

@Pipe({
  name: 'objToType'
})
export class ObjToTypePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value instanceof ProjectFolder ? 'folder' :
      value instanceof ProjectComponent ? 'component' :
      value instanceof ProjectComponentInstance ? 'instance' : 'element';
  }

}
