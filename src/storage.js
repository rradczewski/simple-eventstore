// @flow
import { readFile, readFileSync, writeFileSync } from 'fs';
import type { Event } from './event';

export type StorageBackend = {
  readStoreSync: () => Event[],
  readStoreAsync: () => Promise<Event[]>,
  writeStoreSync: (events: Event[]) => any
};

const readFilePromise: (file: string) => Promise<string> = (file) => new Promise((resolve, reject) =>
  readFile(file, 'utf8', (err, data) => err ? reject(err) : resolve(data))
);


export const JsonFileStorageBackend: (file: string) => StorageBackend = file => ({
  readStoreAsync: () => readFilePromise(file)
      .then(data => JSON.parse(data))
      .catch(() => []),

  readStoreSync: () => {
    try {
      return JSON.parse(readFileSync(file, 'utf8'));
    } catch (e) {
      return [];
    }
  },

  writeStoreSync: (events) =>
    writeFileSync(file, JSON.stringify(events), 'utf8')
});

export const InMemoryStorageBackend: () => StorageBackend = () => {
  let events = [];
  return {
    readStoreAsync: () => Promise.resolve(events),
    readStoreSync: () => events,
    writeStoreSync: (newEvents) => events = newEvents
  }
};