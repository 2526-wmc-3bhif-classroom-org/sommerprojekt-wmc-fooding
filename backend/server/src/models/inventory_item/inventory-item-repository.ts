import { DB } from "../../db/database";

export interface InventoryItem {
    inventory_id?: number;
    user_id: number;
    product_id: number;
    quantity: number;
    expiration_date: string;
    location?: string;
    // Joined fields
    product_name?: string;
    default_unit?: string;
    category?: string;
}

export class InventoryItemRepository {
    private static get db() {
        return DB.getConnection();
    }

    public static findAllByUserId(userId: number): InventoryItem[] {
        return this.db.prepare(`
            SELECT i.*, p.name as product_name, p.default_unit, p.category 
            FROM inventory_items i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.user_id = ?
            ORDER BY i.expiration_date ASC
        `).all(userId) as InventoryItem[];
    }

    public static create(item: InventoryItem): number {
        const result = this.db.prepare(`
            INSERT INTO inventory_items (user_id, product_id, quantity, expiration_date, location) 
            VALUES (?, ?, ?, ?, ?)
        `).run(item.user_id, item.product_id, item.quantity, item.expiration_date, item.location);
        
        return result.lastInsertRowid as number;
    }

    public static update(item: InventoryItem): boolean {
        const result = this.db.prepare(`
            UPDATE inventory_items 
            SET quantity = ?, expiration_date = ?, location = ? 
            WHERE inventory_id = ? AND user_id = ?
        `).run(item.quantity, item.expiration_date, item.location, item.inventory_id, item.user_id);
        
        return result.changes > 0;
    }

    public static delete(inventory_id: number, userId: number): boolean {
        const result = this.db.prepare("DELETE FROM inventory_items WHERE inventory_id = ? AND user_id = ?")
            .run(inventory_id, userId);
        return result.changes > 0;
    }

    public static getTotalAmount(userId: number, productId: number): number {
        const result = this.db.prepare(`
            SELECT SUM(quantity) as total 
            FROM inventory_items 
            WHERE user_id = ? AND product_id = ?
        `).get(userId, productId) as { total: number | null };
        
        return result?.total || 0;
    }
}
