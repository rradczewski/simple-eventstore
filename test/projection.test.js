import { on, projection } from '../src';
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

describe('on', () => {
  it('provides a shorthand to build event handlers', () => {
    const eventHandler = on('FOO', (s, m) => s+m);

    expect(eventHandler.type).toEqual('FOO');
    expect(eventHandler.fold('FOO', 'BAR')).toEqual('FOOBAR');
  });
});

