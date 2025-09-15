import { SavedTrip } from '@/types';

const DB_NAME = 'FlyWiseDB';
const STORE_NAME = 'savedTrips';
const DB_VERSION = 1;

let db: IDBDatabase;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Error opening DB");

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const getAllTrips = async (): Promise<SavedTrip[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // IndexedDB getAll returns items sorted by key, so we reverse to show newest first
      resolve(request.result.reverse());
    };
    request.onerror = () => reject("Error fetching trips");
  });
};

export const saveTrip = async (trip: SavedTrip): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(trip);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error saving trip");
  });
};

export const deleteTrip = async (tripId: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(tripId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error deleting trip");
  });
};
