// @flow
import type { Event } from './event';
import type { Projection } from './projection';

import type { StorageBackend } from './storage'; // eslint-disable-line import/no-duplicates
import { JsonFileStorageBackend } from './storage'; // eslint-disable-line import/no-duplicates


class EventStore {
  storageBackend: StorageBackend;

  constructor(file: string | StorageBackend) {
    if(typeof file === 'string') {
      this.storageBackend = JsonFileStorageBackend(file);
    } else {
      this.storageBackend = file;
    }
  }

  storeEvent(e: Event, expectedVersion: ?number) {
    const previousEvents = this.storageBackend.readStoreSync();
    if(expectedVersion != null && previousEvents.length !== expectedVersion) {
      throw new Error(`Expected store version to be ${expectedVersion}, but was ${previousEvents.length}`);
    }
    this.storageBackend.writeStoreSync(previousEvents.concat(e));
  }

  project<S>(projection: Projection<S>): Promise<S> {
    return this.storageBackend.readStoreAsync()
      .then(projection);
  }

  version(): Promise<number> {
    return this.storageBackend.readStoreAsync()
      .then(events => events.length);
  }
}

export default EventStore;
