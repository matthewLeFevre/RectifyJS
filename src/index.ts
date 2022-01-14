import r from "rethinkdb";

export interface RectifyInt {
  host: string;
  port: number;
  db: string;
  tableNames: string[];
}

export enum RectifyOperator {
  EQ = "==",
  GT = ">",
  LT = "<",
  GE = ">=",
  LE ="<=",
  NE = "!="
}

export default class Rectify {
  conn;
  db: string;
  tables: {[key: string]: Table};
  constructor(conn, db, tables) {
    this.conn = conn;
    this.db = db;
    this.tables = tables;
  }
  public static async build({ host="localhost", port = 28015, db = "test", tableNames = [] }: RectifyInt){
    try {
      const tables = {};
      const conn = await r.connect({host, port});
      const dbList = await r.dbList().run(conn);
      if(!dbList.includes(db)) console.log(await r.dbCreate(db).run(conn));
      conn.use(db);
      const tableList = await r.tableList().run(conn);
      const tablesToCreate = tableNames.filter(table => !tableList.includes(table));
      await Promise.all(tablesToCreate.map(table => r.tableCreate(table).run(conn)));
      tableNames.forEach(name => tables[name] = new Table(name, conn));
      return new Rectify(conn, db, tables);
    } catch(err) {
      throw err;
    }
  }
}

export class Table {
  name;
  conn;
  constructor(table, conn) {
    this.name = table;
    this.conn = conn;
  }

  async create(item) {
    const dateCreated = Date.now();
    const results = await r.table(this.name).insert({...item, dateCreated}).run(this.conn);
    if(results.inserted !== 1) throw new Error(`Error creating ${this.name}`);
    return results.generated_keys[0];
  }
  async createWithId(id, item) {
    const dateCreated = Date.now();
    const results = await r.table(this.name).insert({...item, id, dateCreated}).run(this.conn);
    console.log(results);
    if(results.inserted !== 1) throw new Error(`Error creating ${this.name}`);
    return id;
  }
  async updateWithId(id, changes) {
    const results = await r.table(this.name).get(id).update(changes).run(this.conn);
    if(results.replaced !== 1) throw new Error(`Error updating ${this.name}`);
  }
  async deleteWithId(id) {
    const results = await r.table(this.name).get(id).delete().run(this.conn);
    if(results.deleted !== 1) throw new Error(`Error deleting ${this.name}`);
  }
  async deleteAll() {
    await r.table(this.name).delete().run(this.conn);
  }
  async getWithId(id) {
    const results = await r.table(this.name).get(id).run(this.conn);
    if(!results) throw new Error(`Error retrieving ${this.name} with id ${id}`);
    return results;
  }
  async getAll() {
    const results = await r.table(this.name).orderBy(r.desc("dateCreated")).run(this.conn);
    return results;
  }
  async getWithQuery(field, operator: RectifyOperator, value) {
    switch(operator) {
      case RectifyOperator.GT:
        return await r.table(this.name).g(field).gt(value).run(this.conn)
      case RectifyOperator.LT:
        return await r.table(this.name).g(field).lt(value).run(this.conn)
      case RectifyOperator.GE:
        return await r.table(this.name).g(field).ge(value).run(this.conn)
      case RectifyOperator.LE:
        return await r.table(this.name).g(field).le(value).run(this.conn)
      case RectifyOperator.NE:
        return await r.table(this.name).g(field).ne(value).run(this.conn)
      case RectifyOperator.EQ:
      default:
        return await r.table(this.name).g(field).eq(value).run(this.conn)
    }
  }
}

(async function() {
  try{
    const test = await Rectify.build({
      db: "auth-command",
      host: "localhost",
      port: 28015,
      tableNames: ['users']
    });
  
    await test.tables.users.deleteAll();

    const id = await test.tables.users.create({
      name: 'Matthew Lefevre',
      height: "6ft 3in",
      weight: 220,
      isMarried: true
    });
  
    console.log("New User ID:", id);
  
    await test.tables.users.updateWithId(id, {name: "Matthew Robert Lefevre"});

    const user = await test.tables.users.getWithId(id);

    console.log("Updated User", user);

    await Promise.all([
      test.tables.users.create({
        name: "Courtney Lefevre",
        height: "5ft 10in",
        weight: 210,
        isMarried: true
      }),
      test.tables.users.createWithId("bacon", {
        name: "Madelyn Lefevre",
        height: "3ft 10in",
        weight: 39,
        isMarried: false
      }),
    ]);

    const users = await test.tables.users.getAll();
    
    console.log("All users", users);
    
    await test.tables.users.deleteWithId(id);

    const existingUsers = await test.tables.users.getAll();

    console.log("All existing users", existingUsers);

    await test.tables.users.deleteAll();

  } catch(err) {
    console.error(err);
  }
})()
