import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';


@Injectable()
export class ProjectService implements Resolve<any> {
  constructor() { }

  resolve() {
    return Observable.of(null);
  }
}
