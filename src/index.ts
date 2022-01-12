import r from "rethinkdb";

export interface RectifyInt {
  host: string;
  port: number;
  db: string;
  tables: string[];
}

export default class Rectify {
  conn;
  db;
  tables;
  constructor({ host, port = 28015, db = "test", tables }: RectifyInt) {
    r.connect({ host, port, db }, (err, conn) => {
      if (err) throw err;
      this.conn = conn;
      let tableList: string[] = [];
      r.dbList().run(this.conn, (err, result) => {
        console.log(result);
      });
      // r.tableList().run(conn, (err, result) => {
      //   if (err) throw err;
      //   tableList = result;
      // });

      // const tablesToCreate = tables.filter(table => !tableList.includes(table));

      // tablesToCreate.forEach(table => {
      //   r.tableCreate(table).run(conn);
      //   this.tables[table] = new Table(table, conn);
      // });
    });
  }
}

export class Table {
  name;
  conn;
  constructor(table, conn) {
    this.name = table;
    this.conn = conn;
  }
}

const test = new Rectify({
  host: process.env.HOST,
  port: process.env.PORT,
  db: "test",
  tables: ["users", "images", "posts"],
});
