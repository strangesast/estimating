import { GitStore, Db } from './git-idb';
import * as uuid from 'uuid/v4';
import { test } from './util';
import { ProjectComponentInstance, ProjectComponent, ProjectFolder, Person, Project } from './models';

describe('git stuff', () => {
  let person: Person = {
    name: 'Sam Zagrobelny',
    username: 'sazagrobelny',
    email: 'sazagrobelny@dayautomation.com'
  } as Person;

  it ('should encode person', test(async () => {
  }));

  it ('should create example branch, save trees/commit', test(async () => {
    let db = new Db();
    let gs = new GitStore(db);

    await db.delete();
    await db.open();
    await gs.delete();
    await gs.open();

    await gs.createBranch('master');

    let status = await gs.status();
    console.log('status', status);

    // root folder
    let buildingFolder = new ProjectFolder({ id: uuid(), name: 'Building Folder 1', description: null, folder: null, type: 'building' });
    let componentFolder = new ProjectFolder({ id: uuid(), name: 'Component Folder 1', description: null, folder: null, type: 'component' });

    let component = new ProjectComponent({ id: uuid(), name: 'Component 1', description: null, folder: componentFolder.id });
    let componentInstance = new ProjectComponentInstance({ id: uuid(), name: 'Component 1 Instance 1', component: component.id, description: null, folders: { building: buildingFolder.id }});

    await db.folders.bulkAdd([buildingFolder,componentFolder]);
    await db.components.add(component);
    await db.instances.add(componentInstance);

    await gs.add(component);

    status = await gs.status();
    console.log('status', status);

  }));
});
