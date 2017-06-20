import { GitStore } from './git-store';
import { Commit } from './models';
import { modes } from './modes';
type Constructor<T = {}> = new (...args: any[]) => T;

export function Walker<T extends Constructor<GitStore>>(Base: T) {
  return class extends Base {
    async *walkCommits(hash) { let commit = await this.getObject('commit', hash) as Commit; let parents = commit.parents; do { if (!commit) throw new Error('invalid hash reference'); yield commit; commit = await this.getObject('commit', commit.parents[0]) as Commit;
      } while (commit && commit.parents.length == 1);
      yield commit;
      if (commit.parents.length > 1) {
        return 1;
      }
      return 0;
    }
  
    async *walkTrees(hash) {
      let root = await this.getObject('tree', hash);
      let tree = { root: null };
  
      let children = [{ object: { name: 'root', type: 'tree', body: root }, context: tree }];
      let depth = 0;
  
      while (children.length) {
        let toLoad = {};
        for (let { object, context } of children) {
          let { type, body, name } = object;
          if (type == 'tree') {
            let subtree = {};
            context[name] = subtree;
            for (let name in body) {
              let { hash, mode } = body[name];
              toLoad[hash] = { object: { name, type: modes.toType(mode), body: null }, context: subtree };
            }
          } else {
            context[name] = body;
          }
        }
        let hashes = Object.keys(toLoad);
        let objects = await this.getManyRawObjects(hashes);
        if (hashes.length != objects.length) throw new Error('missing child!');
        children = [];
        for (let i=0; i < hashes.length; i++) {
          let hash = hashes[i];
          let object = objects[i];
          toLoad[hash].object.body = object.body;
          children.push(toLoad[hash]);
        }
  
        yield tree.root;
      }
    }
  }
}
