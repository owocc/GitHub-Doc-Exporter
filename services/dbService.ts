import { HistoryEntry } from '../types';

let db: IDBDatabase;
const DB_NAME = 'GitHubDocExporterDB';
const STORE_NAME = 'history';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const addHistory = (entry: HistoryEntry): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    const dbInstance = await initDB();
    const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(entry);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      console.error('Error adding history:', request.error);
      reject('Could not add history entry');
    };
  });
};

export const getAllHistory = (): Promise<HistoryEntry[]> => {
  return new Promise(async (resolve, reject) => {
    const dbInstance = await initDB();
    const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort by timestamp descending to show newest first
      resolve(request.result.sort((a, b) => b.timestamp - a.timestamp));
    };

    request.onerror = () => {
      console.error('Error fetching history:', request.error);
      reject('Could not fetch history');
    };
  });
};


export const deleteHistory = (id: number): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if(!id) return reject('Invalid ID provided for deletion');
    const dbInstance = await initDB();
    const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Error deleting history:', request.error);
      reject('Could not delete history entry');
    };
  });
};
