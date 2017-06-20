import { Git } from './git';
import { ProjectObject, Project, Component, ComponentInstance, ObjectRecord } from './models';
import * as uuid from 'uuid/v4';

export class ProjectStore extends Git {
  constructor(name, version?) {
    super(name, version);
    console.log('uuid', uuid);
  }
  encodeOne(el, save=true) {
    if (el instanceof ProjectObject) {
      el = JSON.stringify(el);
    }

    return super.encodeOne(el, save);
  }

  async add(object) {
    if (!(object instanceof ProjectObject)) {
      throw new Error('invalid object for this operation');
    }
    if (object instanceof Project) {
      let record: ObjectRecord = { path: 'project.json', body: object, hash: null, buffer: null, type: null } as ObjectRecord;
      await this.setIndexRecord(record);
      return record;
    }
  }
  put() {}
  delete() {}
}
