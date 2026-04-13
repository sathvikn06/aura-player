import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'aura-player-db';
const STORE_NAME = 'songs-cache';

export interface CachedSong {
  id: string;
  blob: Blob;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const cacheSong = async (id: string, blob: Blob) => {
  const db = await getDB();
  await db.put(STORE_NAME, {
    id,
    blob,
    timestamp: Date.now(),
  });
};

export const getCachedSong = async (id: string): Promise<Blob | null> => {
  const db = await getDB();
  const cached = await db.get(STORE_NAME, id);
  return cached ? cached.blob : null;
};

export const isSongCached = async (id: string): Promise<boolean> => {
  const db = await getDB();
  const count = await db.count(STORE_NAME, id);
  return count > 0;
};
