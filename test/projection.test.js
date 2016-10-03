import { on, projection, event, EventStore, InMemoryStorageBackend } from '../src';
import expect from 'expect';

describe('projection', () => {
  it('folds over a list of events', () => {
    const someProjection = projection(
      {type: 'FOO', fold: (state, event) => state.concat(event.type)},
      {type: 'BAR', fold: (state, event) => state.concat(event.type)}
    )([]);

    const result = someProjection([{type: 'FOO'}, {type: 'IGNORED'}, {type: 'BAR'}]);

    expect(result).toEqual(['FOO', 'BAR']);
  });
});

const propEq = (propName, value) => obj => obj[propName] === value;

describe('on', () => {
  it('provides a shorthand to build event handlers', () => {
    const eventHandler = on('FOO', (s, m) => s+m);

    expect(eventHandler.type).toEqual('FOO');
    expect(eventHandler.fold('FOO', 'BAR')).toEqual('FOOBAR');
  });

  xit('can also take a predicate for applying the fold', () => {
    const eventStore = new EventStore(InMemoryStorageBackend());

    const Foo = event('FOO');
    eventStore.storeEvent(Foo({ userId: '124', userName: 'shouldnt_show_up'}));
    eventStore.storeEvent(Foo({ userId: '123', userName: 'should_show_up'}));

    const someProjection = projection(
      on("FOO", propEq("userId", "123"), (state, {userName}) => state.concat(userName))
    )([]);

    return eventStore.project(someProjection)
      .then(result => {
        expect(result).toEqual(['should_show_up']);
      });
  });
});

