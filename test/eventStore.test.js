import path from 'path';
import fs from 'fs';
import os from 'os';
import expect from 'expect';

import { EventStore, event, projection, on } from '../src/index';

const getTmpFile = () => path.join(os.tmpdir(), `eventStore-${Math.random()*100000000 | 0}.json`);

describe('the eventstore', () => {
  const SOME_EVENT = event('SOME_EVENT');
  const SOME_OTHER_EVENT = event('SOME_OTHER_EVENT');

  describe('storage', () => {
    it('appends events to the file it is backed by', () => {
      const tmpFile = getTmpFile();
      const store = new EventStore(tmpFile);
      const theEvent = SOME_EVENT();
      const anotherEvent = SOME_OTHER_EVENT();
      store.storeEvent(theEvent);
      store.storeEvent(anotherEvent);
 
      const inJson = JSON.parse(fs.readFileSync(tmpFile, 'utf8'));
      expect(inJson).toEqual([theEvent, anotherEvent]);
    });

    describe('versioning', () => {
      it('provides a version of the storage to expect when writing to it', () => {
        const tmpFile = getTmpFile();
        const store = new EventStore(tmpFile);

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
        const tmpFile = getTmpFile();
        const store = new EventStore(tmpFile);

        store.storeEvent(SOME_EVENT());

        expect(() => {
          store.storeEvent(SOME_EVENT(), 0);
        }).toThrow();
      });
    });
  });

  describe('projecting a strema', () => {
    it('returns a Promise for the projection', () => {
      const someProjection = projection(
        on('SOME_EVENT', (s, e) => s.concat(e.type)),
        on('SOME_OTHER_EVENT', (s, e) => s.concat(e.type))
      )([]);

      const tmpFile = getTmpFile();
      const store = new EventStore(tmpFile);

      const theEvent = SOME_EVENT();
      const anotherEvent = SOME_OTHER_EVENT();
      store.storeEvent(theEvent);
      store.storeEvent(anotherEvent);


      return store.project(someProjection)
        .then(result => expect(result).toEqual(['SOME_EVENT', 'SOME_OTHER_EVENT']));
    })
  });
});
