import { DB } from "../../db/database";

export interface Product {
    product_id?: number;
    name: string;
    default_unit: string;
    category?: string;
}

export class ProductRepository {
    private static get db() {
        return DB.getConnection();
    }

    public static create(name: string, default_unit: string, category?: string): number {
        const result = this.db.prepare("INSERT INTO products (name, default_unit, category) VALUES (?, ?, ?)")
            .run(name, default_unit, category || null);
        return result.lastInsertRowid as number;
    }

    public static findAll(): Product[] {
        return this.db.prepare("SELECT * FROM products ORDER BY name").all() as Product[];
    }

    public static findById(product_id: number): Product | undefined {
        return this.db.prepare("SELECT * FROM products WHERE product_id = ?")
            .get(product_id) as Product | undefined;
    }

    public static update(product_id: number, name: string, default_unit: string, category?: string): boolean {
        const result = this.db.prepare("UPDATE products SET name = ?, default_unit = ?, category = ? WHERE product_id = ?")
            .run(name, default_unit, category || null, product_id);
        return result.changes > 0;
    }

    public static delete(product_id: number): boolean {
        const result = this.db.prepare("DELETE FROM products WHERE product_id = ?")
            .run(product_id);
        return result.changes > 0;
    }
}
