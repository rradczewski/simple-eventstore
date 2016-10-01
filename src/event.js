// @flow

export type Event = {
  type: string,
  meta: {
    time: string
  },
  payload: ?Object
}

const event: (type: string) => (payload: ?Object, meta: ?Object) => Event =
  (type) => (payload = {}, meta = {}) => ({
    type,
    payload,
    meta: Object.assign({}, meta, { time: new Date().toISOString() })
  });

export default event;
