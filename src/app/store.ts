import { ObjectRecord } from './models';

interface Store {
  get(storeName: string, query: string|IDBKeyRange): Promise<ObjectRecord> | ObjectRecord;
  set(storeName: string, value: ObjectRecord): Promise<number|string>;
  getAll(storeName: string, query: string[]): Promise<ObjectRecord[]> | ObjectRecord[];
  setMany(storeName: string, values: ObjectRecord[]): Promise<(number|string)[]> | (number|string)[];
}

export class IDBStore implements Store {
  HEAD: string;

  constructor(public name: string, public version: number = 1) {}
  protected _db: IDBDatabase;
  get db(): Promise<IDBDatabase> {
    return this._db ? Promise.resolve(this._db) : this.init();
  }

  async set(storeName, value) {
    let db = await this.db;
    return new Promise((resolve, reject) => {
      let store = db.transaction([storeName], 'readwrite').objectStore(storeName);
      let req = store.put(value)
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async get(storeName, query) {
    let db = await this.db;
    return new Promise((resolve, reject) => {
      let store = db.transaction([storeName]).objectStore(storeName);
      let req = store.get(query)
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getAll(storeName): Promise<any[]> {
    let db = await this.db;
    return new Promise((resolve, reject) => {
      let store = db.transaction([storeName]).objectStore(storeName);
      let req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }) as Promise<any[]>;
  }

  async getMany(storeName, keys): Promise<any[]> {
    let db = await this.db;
    let transaction = db.transaction([storeName]);
    keys.sort(comparer);
    let result = await new Promise((resolve, reject) => {
      let i = 0;
      let request = transaction.objectStore(storeName).openCursor();
      let results = [];
      request.onsuccess = (e) => {
        let cursor = request.result;
        if (!cursor) return resolve(results);
        let key = cursor.key;
        while (key > keys[i]) {
          ++i
          if (i === keys.length) {
            return resolve(results);
          }
        }
        if (key === keys[i]) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          cursor.continue(keys[i]);
        }
      };
      request.onerror = (e) => reject(e);
    });
    return result as any[];
  }

  async setMany(storeName, objects: any[]): Promise<string[]> {
    let db = await this.db;
    let transaction = db.transaction([storeName], 'readwrite');
    let store = transaction.objectStore(storeName);
    let result = <string[]>(await new Promise((resolve, reject) => {
      let i = 0;
      next();
      function next() {
        if (i < objects.length) {
          store.put(objects[i++]).onsuccess = next;
        } else {
          resolve(objects.map(({ hash }) => hash));
        }
      }
    }));
    return result;
  }

  init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      let req = indexedDB.open(this.name + '-store', this.version);
      
      req.onerror = () => reject(req.error);
      req.onupgradeneeded = () => {
        let db = req.result;
        db.createObjectStore('objects', { keyPath: 'hash' });
        db.createObjectStore('refs', { keyPath: 'name' });
        db.createObjectStore('index');
      }
      req.onsuccess = () => resolve(this._db = req.result);
    });
  }
}

function comparer (a, b) {
  return a < b? -1 : a > b ? 1 : 0;
}
