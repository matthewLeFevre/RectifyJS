# RectifyJS

Opinionated completely asynchronous ODM for RethinkDB. Provides generic CRUD functionality out of the box. Fill free to use `Promises` or `Async Await` with `try catch`. All examples are with `Async Await`.

## Installation

```
yarn add rectify-js
```

## Setup

```typescript
import Rectify from "rectify-js";

let DB: Rectify;

(async function () {
  try {
    DB = await Rectify.build({
      db: process.env.RETHINK_DB_NAME,
      host: process.env.RETHINK_DB_HOST,
      port: process.env.RETHINK_DB_PORT,
      tableNames: ["users", "posts", "comments"],
    });
  } catch (e) {
    console.error(e);
  }
})();
```

### Rectify.build

Instantiates a new instance of `Rectify`

| Param      | Default Values | Type     |
| ---------- | -------------- | -------- |
| db         | "test"         | string   |
| host       | "localhost"    | string   |
| port       | 28015          | number   |
| tableNames | []             | string[] |

## Usage

Methods for all CRUD Operations

**Create:**

- `create`
- `createWithId`

**Read:**

- `getAll`
- `getWithId`
- `getWithQuery`

**Update:**

- `updateWithId`

**Delete:**

- `deleteWithId`
- `deleteAll`

### Create

Create methods always return `id` of newly created item.

```typescript
(async function () {
  const id = await DB.tables.users.create({
    name: "John",
    age: 37,
    isMarried: true,
  });

  const id = await DB.tables.users.createWithId("random-id", {
    name: "Jill",
    age: 23,
    isMarried: false,
  });
})();
```

### Read

```typescript
(async function () {
  const users = await DB.tables.users.getAll();

  const user = await DB.tables.users.getWithId("random-id");

  const users = await DB.tables.users.getWithQuery(
    "field",
    RectifyOperator.EQ,
    "value"
  );
})();
```

### Update

```typescript
(async function () {
  const id = await DB.tables.users.updateWithId("random-id", {
    name: "John",
    age: 37,
    isMarried: true,
  });
})();
```

### Delete

```typescript
(async function () {
  const id = await DB.tables.users.create({
    name: "John",
    age: 37,
    isMarried: true,
  });

  const id = await DB.tables.users.createWithId("random-id", {
    name: "Jill",
    age: 23,
    isMarried: false,
  });
})();
```
