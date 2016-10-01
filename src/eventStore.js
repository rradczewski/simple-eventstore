// @flow
import { readFile, readFileSync, writeFileSync } from 'fs';
import type { Event } from './event';

const readStoreAsync: (file: string) => Promise<Event[]> = (file) =>
  new Promise((resolve, reject) =>
    readFile(file, 'utf8', (err, data) => err ? reject(err) : resolve(data))
  )
    .then(data => JSON.parse(data))
    .catch(() => []);

const readStoreSync: (file: string) => Event[] = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch(e) {
    return [];
  }
};

const writeStoreSync: (file: string, events: Event[]) => void = (file, events) =>
  writeFileSync(file, JSON.stringify(events), 'utf8');


class EventStore {
  file: string;

  constructor(file: string) {
    this.file = file;
  }

  storeEvent(e: Event, expectedVersion: ?number) {
    const previousEvents = readStoreSync(this.file);
    if(expectedVersion != null && previousEvents.length !== expectedVersion) {
      throw new Error(`Expected store version to be ${expectedVersion}, but was ${previousEvents.length}`);
    }
    writeStoreSync(this.file, previousEvents.concat(e));
  }

  version(): Promise<number> {
    return readStoreAsync(this.file)
      .then(events => events.length)
  }
}


export default EventStore;
