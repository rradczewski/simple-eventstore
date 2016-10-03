import path from 'path';
import fs from 'fs';
import os from 'os';
import expect from 'expect';

import { EventStore, event, projection, on } from '../src/index';

describe('JsonFilestorageBackend', () => {
  const getTmpFile = () => path.join(os.tmpdir(), `eventStore-${Math.random()*100000000 | 0}.json`);

  const SOME_EVENT = event('SOME_EVENT');
  const SOME_OTHER_EVENT = event('SOME_OTHER_EVENT');

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

  it('reads from the JSON file', () => {
    const tmpFile = getTmpFile();
    fs.writeFileSync(tmpFile, JSON.stringify([{'type': 'FOO'}]), 'utf8');

    const store = new EventStore(tmpFile);

    return store.project(projection(on('FOO', () => ['FOO']))([]))
      .then(result => {
        expect(result).toEqual(['FOO']);
      });
  });
});
