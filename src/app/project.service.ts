import { Injectable } from '@angular/core';
import { Commit } from './git';
import * as sha1 from 'js-sha1';

import { modes } from './modes';

const NAME = 'estimating';

@Injectable()
export class ProjectService {
  HEAD: string;

  constructor() { }
}
