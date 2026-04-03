// NO AI used here, but copied code from the CRUD Flightmanagement exercise and adjusted it


import BetterSqlite3 = require("better-sqlite3");
import type { Database as DatabaseType } from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";

const dataDir = path.join(process.cwd(), "data");
const dbFileName = path.join(dataDir, "food.db");

export class DB {
    private static instance: DatabaseType | null = null;

    public static getConnection(): DatabaseType {
        if (!DB.instance) {
            fs.mkdirSync(dataDir, { recursive: true });

            DB.instance = new BetterSqlite3(dbFileName, {
                fileMustExist: false,
                verbose: (s: unknown) => DB.logStatement(s)
            });

            DB.instance.pragma("foreign_keys = ON");
            DB.ensureTablesCreated(DB.instance);
        }

        return DB.instance;
    }

    public static createDBConnection(): DatabaseType {
        return DB.getConnection();
    }

    public static beginTransaction(connection: DatabaseType): void {
        connection.exec("BEGIN TRANSACTION;");
    }

    public static commitTransaction(connection: DatabaseType): void {
        connection.exec("COMMIT;");
    }

    public static rollbackTransaction(connection: DatabaseType): void {
        connection.exec("ROLLBACK;");
    }

    private static logStatement(statement: unknown): void {
        if (typeof statement !== "string") {
            return;
        }

        const start = statement.slice(0, 12).trim().toLowerCase();
        if (start.startsWith("pragma") || start.startsWith("create table")) {
            return;
        }

        console.log(`SQL: ${statement}`);
    }

    private static ensureTablesCreated(connection: DatabaseType): void {
        connection.exec(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,                                 
                password_hash TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS products (
                product_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                default_unit TEXT NOT NULL,
                category TEXT
            );

            CREATE TABLE IF NOT EXISTS recipes (
                   recipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
                   user_id INTEGER NOT NULL,
                   title TEXT NOT NULL,
                    instructions TEXT NOT NULL,
                   FOREIGN KEY (user_id) REFERENCES users(user_id)
            );

            CREATE TABLE IF NOT EXISTS recipe_ingredients (
                recipe_ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
                recipe_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity REAL NOT NULL,
                FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
                FOREIGN KEY (product_id) REFERENCES products(product_id)
            );

            CREATE TABLE IF NOT EXISTS inventory_items (
                inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity REAL NOT NULL,
                expiration_date TEXT NOT NULL,
                location TEXT,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (product_id) REFERENCES products(product_id)
            );

            CREATE TABLE IF NOT EXISTS shopping_list_items (
                shopping_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                recipe_id INTEGER,
                quantity REAL NOT NULL,
                checked INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (product_id) REFERENCES products(product_id),
                FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id)
            );
        `);
    }
}