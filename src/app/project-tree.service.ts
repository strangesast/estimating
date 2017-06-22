import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ProjectService } from './project.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ProjectTreeService implements Resolve<any> {
  buildingFolders: BehaviorSubject<any>;
  activeChild: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor(private project: ProjectService) { }

  resolve() {
    this.buildingFolders = this.project.buildingFolders;
  }

}
