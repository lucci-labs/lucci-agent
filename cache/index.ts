import rocksdb from "rocksdb";

class RocksDBHandler {
  private db: rocksdb;

  constructor(path: string) {
    this.db = rocksdb(path);
  }

  async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.open({ create_if_missing: true }, (err: any) => {
        if (err) {
          reject("Failed to open the database: " + err);
        } else {
          resolve();
        }
      });
    });
  }

  async set(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const stringValue = JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v);
      this.db.put(key, stringValue, (err: any) => {
        if (err) {
          reject("Failed to put key-value: " + err);
        } else {
          resolve();
        }
      });
    });
  }

  async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(key, (err: any, value: any) => {
        if (err) {
          reject("Failed to get value: " + err);
        } else {
          try {
            const parsedValue = JSON.parse(value.toString());
            resolve(parsedValue);
          } catch (e) {
            reject("Failed to parse value: " + e);
          }
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err: any) => {
        if (err) {
          reject("Failed to close the database: " + err);
        } else {
          resolve();
        }
      });
    });
  }
}

const dbHandler = new RocksDBHandler("./db");

export default dbHandler;