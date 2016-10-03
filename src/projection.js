// @flow
import type { Event } from './index';

type EventHandler<S> = {
  type: string,
  fold: Fold<S>,
};
type Fold<S> = (state: S, event: Event) => S;

const on: (type: string, fold: Fold<*>) => EventHandler<*> = (type: string, fold) => ({
  type,
  fold
});

export { on };

export type Projection<S> = (events: Event[]) => S;

const projection: <S>(handlers: EventHandler<S>[]) => (state: S) => Projection<S> =
  (...handlers) => {
    const handlersCache = handlers.reduce((c: Object, h: EventHandler<*>) => Object.assign(c, {[h.type]: h.fold}), {});

    return initialState => events =>
      events.reduce((state, event) => typeof (handlersCache[event.type]) === 'function' ?
        handlersCache[event.type](state, event) :
        state, initialState);
  };


export default projection;

export const eventStreamProjection: (Projection<Event[]>) = (events) => events;