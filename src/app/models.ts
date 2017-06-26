export class ProjectObject {
  _id: string;
  _previousHash?: string;
  _open?: boolean;
  _hash?: string;
  _path?: string;
  _buffer?: Uint8Array;
  _children?: { [id: string]: ProjectObject };
  constructor(fields: Partial<ProjectObject>) {
    Object.assign(this, fields);
  }

  toJSON() {
    return Object.keys(this).reduce((a, key) => key.startsWith('_') ? a : Object.assign(a, { [key]: this[key] }), {});
  }
}

export class ProjectComponent extends ProjectObject {
  id: string; // uuid
  folder: string; // uuid
  name: string;
  description: string;
  constructor(fields: Partial<ProjectComponent>) {
    super(fields);
  }
}

export class ProjectComponentInstance extends ProjectObject {
  id: string; // uuid
  component: string; // uuid
  name: string;
  description: string;
  folders: { [name: string]: string } = {};
  constructor(fields: Partial<ProjectComponentInstance>) {
    super(fields);
  }

}

export class ProjectFolder extends ProjectObject {
  id: string; // uuid
  folder: string; // uuid
  name: string;
  type: string; // type of components contained within.  'component'|'building'|'phase'
  description?: string;
  constructor(fields: Partial<ProjectFolder>) {
    super(fields);
  }
}

export class Project extends ProjectObject {
  name: string;
  shortname: string;
  description: string;
  owner: string;
  constructor(fields: Partial<Project>) {
    super(fields);
  }
}

export class Person implements IPerson {
  constructor(public name: string, public username: string, public email: string) {}
  date?: Date;
}

export interface IndexRecord {
  path: string;
  body: any;
  buffer: Uint8Array;
  hash: string; // body -> buffer -> hash
  previousHash?: string; // what is recorded in HEAD
  status?: string;
}

export interface ObjectRecord {
  hash: string;
  body: any;
  buffer: Uint8Array; // body -> buffer -> hash
  type: string; // 'blob'|'tree'|'commit'|'tag'
}

export interface RefRecord {
  name: string; // like <projectname>/<branch>
  type: string; // remote or local only
  hash: string; // points to commit
}

export interface Commit {
  tree: string;
  parents: string[];
  author: IPerson;
  committer: IPerson;
  message: string;
}

export interface IPerson {
  name: string;
  email: string;
  username?: string;
  date?: Date;
}

export interface Tag {
  object: string;
  type: string;
  tag: string;
  tagger: IPerson;
  message: string;
}

export interface Tree {
  [index: number]: {
    name: string,
    mode: number,
    hash: string
  }
}

export interface TreeObject {
  [name: string]: string | TreeObject;
}

export interface IndexMap {
  [path: string]: IndexRecord;
}
