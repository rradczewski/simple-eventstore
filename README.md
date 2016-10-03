[![CI](https://travis-ci.org/rradczewski/simple-eventstore.svg)](https://travis-ci.org/rradczewski/simple-eventstore)
[![Deps](https://david-dm.org/rradczewski/simple-eventstore.svg)](https://david-dm.org/rradczewski/simple-eventstore) [![DevDeps](https://david-dm.org/rradczewski/simple-eventstore/dev-status.svg)](https://david-dm.org/rradczewski/simple-eventstore)

# Simple EventStore

A simple single-aggregate eventstore without any performance optimizations or locking mechanisms 
but with [FSA-compliant actions](https://github.com/acdlite/flux-standard-action) and a simple projection DSL

## Rationale

I needed a simple persistent storage mechanism for telegram bots with low traffic, but with a fast development pace. 
An eventstore captures events instead of state and lets me deduce state at runtime by folding over the events it has persisted before,
which in turn enables me to build features on top of things that happened before that where recorded.

Reading from the eventstore can happen asynchronously while writing only happens synchronously. 
Writing also takes into consideration an expected version of the store before writing (a very simple transaction mechanism).

## Installation

No release yet, but `npm test` runs the tests and `npm run build` runs babel to produce ES5-code without flowtype annotations.

## Usage

The eventStore can either be created by supplying a `filename` to write to (which is a shorthand for using the `JsonFileStorageBackend`) 
or by supplying a custom `StorageBackend` (such as `InMemoryStorageBackend`, which is used for testing).

```javascript
import { EventStore, InMemoryStorageBackend } from 'simple-eventstore';

const persistentEventStore = new EventStore('my-storage.json');
const inMemoryEventStorage = new EventStorage(InMemoryStorageBackend());
```

After that, it's mainly about defining _Events_ and _Projections_.

### Defining events

Event Factories can be created using the `event` export,  
which is a function `(type: string) => (payload: ?Object, meta: ?Object) => Event`

```javascript
import { event } from 'simple-eventstore';

// Declaring events
const UserJoined = event('USER_JOINED');

// Creating an event
eventStore.storeEvent(UserJoined({name: 'Raimo', twitter: '@rradczewski'}));
```

### Projecting State

State is deduced at runtime by replaying all events in the store and folding them over a _projection_.
A _projection_ is a function `(events: Event[]) => S`. Using the utility functions provided as `{ projection, on }`,
it is very easy to write a simple projection for a specific use case:

```javascript
import { projection, on } from 'simple-eventstore';
import { without } from 'ramda';

const ActiveUsers = projection(
    on('USER_JOINED', (users, event) => users.concat([event.name])),
    on('USER_PARTED', (users, event) => without([event.name], users))
)([]);
```

Later, in your application code, you can request a projection by calling `EventStore#project` 
and supplying the projection you defined earlier:

```javascript
eventStore.project(ActiveUsers)
    .then(activeUsers => {
        console.log(`All active users: ${activeUsers.join(', ')}`);
    });
```
