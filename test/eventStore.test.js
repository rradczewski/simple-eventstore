import expect from 'expect';

import { EventStore, event, projection, on, InMemoryStorageBackend, eventStreamProjection } from '../src/index';

describe('the eventstore', () => {
  const SOME_EVENT = event('SOME_EVENT');
  const SOME_OTHER_EVENT = event('SOME_OTHER_EVENT');

  describe('storage', () => {
    it('can read the events it writes', () => {
      const store = new EventStore(InMemoryStorageBackend());
      const theEvent = SOME_EVENT();
      const anotherEvent = SOME_OTHER_EVENT();
      store.storeEvent(theEvent);
      store.storeEvent(anotherEvent);

      return store.project(eventStreamProjection)
        .then(events => {
          expect(events).toEqual([theEvent, anotherEvent]);
        });
    });

    describe('versioning', () => {
      it('provides a version of the storage to expect when writing to it', () => {
        const store = new EventStore(InMemoryStorageBackend());

        return store.version()
          .then(version => {
            expect(version).toEqual(0);
          })
          .then(() => {
            store.storeEvent(SOME_EVENT());
          })
          .then(() => store.version())
          .then(newVersion => {
            expect(newVersion).toEqual(1);
          });
      });

      it('will refuse to store an event if the provided version number does not match', () => {
        const store = new EventStore(InMemoryStorageBackend());

        store.storeEvent(SOME_EVENT());

        expect(() => {
          store.storeEvent(SOME_EVENT(), 0);
        }).toThrow();
      });
    });
  });

  describe('projecting a stream', () => {
    it('returns a Promise for the projection', () => {
      const someProjection = projection(
        on('SOME_EVENT', (s, e) => s.concat(e.type)),
        on('SOME_OTHER_EVENT', (s, e) => s.concat(e.type))
      )([]);

      const store = new EventStore(InMemoryStorageBackend());

      const theEvent = SOME_EVENT();
      const anotherEvent = SOME_OTHER_EVENT();
      store.storeEvent(theEvent);
      store.storeEvent(anotherEvent);


      return store.project(someProjection)
        .then(result => expect(result).toEqual(['SOME_EVENT', 'SOME_OTHER_EVENT']));
    });
  });
});
