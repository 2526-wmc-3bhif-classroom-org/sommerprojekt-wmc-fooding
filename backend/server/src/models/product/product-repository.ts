import { DB } from "../../db/database";

export interface Product {
    product_id?: number;
    name: string;
    default_unit: string;
}

export class ProductRepository {
    public static create(name: string, default_unit: string): number {
        const db = DB.createDBConnection();
        try {
            const result = db.prepare("INSERT INTO products (name, default_unit) VALUES (?, ?)")
                .run(name, default_unit);
            return result.lastInsertRowid as number;
        } finally {
            db.close();
        }
    }

    public static findAll(): Product[] {
        const db = DB.createDBConnection();
        try {
            const products = db.prepare("SELECT * FROM products ORDER BY name").all() as Product[];
            return products;
        } finally {
            db.close();
        }
    }

    public static findById(product_id: number): Product | undefined {
        const db = DB.createDBConnection();
        try {
            const product = db.prepare("SELECT * FROM products WHERE product_id = ?")
                .get(product_id) as Product | undefined;
            return product;
        } finally {
            db.close();
        }
    }

    public static update(product_id: number, name: string, default_unit: string): boolean {
        const db = DB.createDBConnection();
        try {
            const result = db.prepare("UPDATE products SET name = ?, default_unit = ? WHERE product_id = ?")
                .run(name, default_unit, product_id);
            return result.changes > 0;
        } finally {
            db.close();
        }
    }

    public static delete(product_id: number): boolean {
        const db = DB.createDBConnection();
        try {
            const result = db.prepare("DELETE FROM products WHERE product_id = ?")
                .run(product_id);
            return result.changes > 0;
        } finally {
            db.close();
        }
    }
}
