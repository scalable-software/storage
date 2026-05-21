![License: CC BY-NC-SA 4.0](https://flat.badgen.net/static/license/CC-BY-NC-SA-4.0/green)

# @scalable.software/storage

A small ESM-first browser storage module that wraps IndexedDB with a typed repository layer and a consistent event model.

It provides:

- database lifecycle management through `Storage`
- table-scoped CRUD access through `Repository<T>`
- lifecycle and repository events dispatched from a single `Storage` instance
- lightweight state metadata for activity, status, operations, and events
- repository synchronization through `repo.synchronize(data)`

The module stays deliberately small. It does not add schema migrations, querying helpers, or ORM-style abstractions.

## Installation

```bash
npm install @scalable.software/storage
```

## Quick Start

```typescript
import { Storage } from "@scalable.software/storage";

type Node = {
  id: string;
  name: string;
  type: string;
  coordinates: { x: number; y: number };
  icon: string;
};

const Table = {
  METADATA: "metadata",
  NODES: "nodes",
  CONNECTION: "connection"
} as const;

const storage = new Storage({
  name: "app.storage",
  version: 1,
  tables: [Table.METADATA, Table.NODES, Table.CONNECTION]
});

const database = await storage.create();

const nodes = storage.repository<Node>(Table.NODES);

await nodes.add({
  id: "1",
  name: "Start",
  type: "start",
  coordinates: { x: 0, y: 400 },
  icon: "icon.svg"
});

await nodes.update({
  id: "1",
  name: "Start Updated",
  type: "start",
  coordinates: { x: 10, y: 410 },
  icon: "icon.svg"
});

const result = await nodes.retrieve();

console.log(result);

database.close();

await storage.delete();
```

## Public API

### `Storage`

`Storage` is the main entry point. It extends `EventTarget`, manages the IndexedDB connection, and dispatches both lifecycle and repository events.

```typescript
const storage = new Storage({
  name: "app.storage",
  version: 1,
  tables: ["nodes", "connections"]
});
```

#### Configuration

| Property  | Type       | Required | Description                               |
| --------- | ---------- | -------- | ----------------------------------------- |
| `name`    | `string`   | Yes      | IndexedDB database name                   |
| `version` | `number`   | Yes      | Database version used by IndexedDB        |
| `tables`  | `string[]` | Yes      | Object store names to create              |
| `keyPath` | `string`   | No       | Object store key path, defaults to `"id"` |

#### State getters

`Storage` exposes these read-only properties:

- `name: string`
- `version: number`
- `tables: string[]`
- `keyPath: string`
- `database: IDBDatabase | null`
- `activity: Activity`
- `status: Status`

#### Lifecycle methods

##### `await storage.create()`

Creates the database and creates any configured object stores that do not already exist.

Returns: `Promise<IDBDatabase>`

Side effects:

- sets `activity` to `Activity.CREATING` during the operation
- sets `status` to `Status.READY` on success
- stores the opened `IDBDatabase` in `storage.database`

##### `await storage.open()`

Opens an existing database.

Returns: `Promise<IDBDatabase>`

Side effects:

- sets `activity` to `Activity.OPENING` during the operation
- sets `status` to `Status.READY` on success
- stores the opened `IDBDatabase` in `storage.database`

##### `await storage.delete()`

Closes the current connection, deletes the database, clears `storage.database`, and sets the status to `Status.MISSING`.

Returns: `Promise<void>`

##### `await storage.exists()`

Checks whether a database with the configured `name` and `version` exists.

Returns: `Promise<boolean>`

##### `storage.dispose()`

Closes the current connection without deleting the database, clears `storage.database`, and resets the status to `Status.UNKNOWN`.

Returns: `void`

##### `storage.repository<T>(table)`

Creates a repository bound to a single object store.

Returns: `Repository<T>`

### `Repository<T>`

A repository is bound to a single object store and exposes CRUD plus synchronization helpers.

```typescript
type MyEntity = { id: string; name: string };

const repo = storage.repository<MyEntity>("nodes");
```

`T` must extend `{ id: string }`.

Available methods:

- `add(item): Promise<IDBValidKey>`
- `retrieve(): Promise<T[]>`
- `update(item): Promise<IDBValidKey>`
- `remove(id): Promise<void>`
- `synchronize(data): Promise<void>`

#### `await repo.synchronize(data)`

Synchronizes the table against a desired snapshot.

Behavior:

- updates items whose `id` already exists
- adds items whose `id` does not exist yet
- removes persisted items whose `id` is not present in `data`

```typescript
await repo.synchronize([
  { id: "A", name: "Alpha Updated" },
  { id: "C", name: "Charlie" }
]);
```

## Events

All events are dispatched from the `Storage` instance, including repository operations.

You can subscribe in two ways:

```typescript
import { Event } from "@scalable.software/storage";

storage.addEventListener(Event.BEFORE_ADD, (event) => {
  console.log(event.detail);
});
```

Or by assigning one of the event-handler properties:

```typescript
storage.beforeadd = (event) => {
  console.log(event.detail);
};
```

Available handler properties:

- `beforecreate`
- `aftercreate`
- `beforeopen`
- `afteropen`
- `beforedelete`
- `afterdelete`
- `beforeadd`
- `afteradd`
- `beforeretrieve`
- `afterretrieve`
- `beforeupdate`
- `afterupdate`
- `beforeremove`
- `afterremove`
- `onerror`

Available event constants:

- `Event.BEFORE_CREATE`
- `Event.AFTER_CREATE`
- `Event.BEFORE_OPEN`
- `Event.AFTER_OPEN`
- `Event.BEFORE_DELETE`
- `Event.AFTER_DELETE`
- `Event.BEFORE_ADD`
- `Event.AFTER_ADD`
- `Event.BEFORE_RETRIEVE`
- `Event.AFTER_RETRIEVE`
- `Event.BEFORE_UPDATE`
- `Event.AFTER_UPDATE`
- `Event.BEFORE_REMOVE`
- `Event.AFTER_REMOVE`
- `Event.ON_ERROR`

### Event payloads

Lifecycle events use:

```typescript
type LifecycleDetail = {
  activity: Activity;
  status: Status;
};
```

Repository events use:

```typescript
type RepositoryDetail = {
  table: string;
  id?: string;
};
```

Error events use:

```typescript
type ErrorDetail = {
  operation: Operation;
  error: unknown;
  activity?: Activity;
  status?: Status;
  table?: string;
  id?: string;
};
```

Lifecycle error events from `Storage` include `operation`, `activity`, `status`, and `error`.

Repository error events include:

- `operation`
- `table`
- `error`
- `id` for `add`, `update`, and `remove`

## Metadata Exports

The package exports four metadata objects.

### `Activity`

```typescript
import { Activity } from "@scalable.software/storage";
```

Values:

- `Activity.IDLE`
- `Activity.CREATING`
- `Activity.OPENING`
- `Activity.DELETING`
- `Activity.ADDING`
- `Activity.RETRIEVING`
- `Activity.UPDATING`
- `Activity.REMOVING`

### `Status`

```typescript
import { Status } from "@scalable.software/storage";
```

Values:

- `Status.UNKNOWN`
- `Status.MISSING`
- `Status.READY`

### `Operation`

```typescript
import { Operation } from "@scalable.software/storage";
```

Values:

- `Operation.CREATE`
- `Operation.OPEN`
- `Operation.DELETE`
- `Operation.ADD`
- `Operation.RETRIEVE`
- `Operation.UPDATE`
- `Operation.REMOVE`

### `Event`

```typescript
import { Event } from "@scalable.software/storage";
```

The values are the lowercase DOM event names such as `"beforecreate"` and `"afteradd"`.

## Usage Patterns

### Create once, then work through repositories

```typescript
const storage = new Storage({
  name: "app.storage",
  version: 1,
  tables: ["nodes"]
});

await storage.create();

const repo = storage.repository<{ id: string; name: string }>("nodes");

await repo.add({ id: "1", name: "Alpha" });

const items = await repo.retrieve();

console.log(items);
```

### Observe repository operations centrally

```typescript
storage.addEventListener(Event.AFTER_UPDATE, (event) => {
  console.log("updated", event.detail.table, event.detail.id);
});

storage.addEventListener(Event.ON_ERROR, (event) => {
  console.error(event.detail.operation, event.detail.error);
});
```

### Open an existing database later

```typescript
const storage = new Storage({
  name: "app.storage",
  version: 1,
  tables: ["nodes"]
});

if (await storage.exists()) {
  await storage.open();
}
```

## Notes And Limitations

- This package is intended for browser environments with IndexedDB support.
- `Repository<T>` requires `T` to include an `id: string` property.
- Even if a custom `keyPath` is configured for the database, the repository API still operates on `id`.
- `storage.exists()` checks the configured `name` and `version` together.
- `storage.delete()` can reject if IndexedDB reports a blocked delete.
- CRUD operations reject their promises on failure and also emit `Event.ON_ERROR` from the parent `Storage` instance.
- `storage.repository(table)` does not validate table names eagerly; failures surface when IndexedDB transactions run.

## Exports

Root exports:

- `Storage`
- `Repository`
- `Activity`
- `Status`
- `Operation`
- `Event`
- `Configuration` type

## Development

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Build the package:

```bash
npm run build
```

Generate API documentation:

```bash
npm run document
```

Run the demo application:

```bash
npm run serve
```

## License

This project is licensed under **CC BY-NC-SA 4.0**.

You may share and adapt the work with attribution, but not for commercial purposes, and derivative works must be distributed under the same or a compatible license.

See the [LICENSE](./LICENSE) file for details.
