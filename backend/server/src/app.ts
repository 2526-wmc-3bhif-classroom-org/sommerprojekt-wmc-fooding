import { DB } from "./db/database";

const db = DB.createDBConnection();
db.close();

console.log("food.db created");