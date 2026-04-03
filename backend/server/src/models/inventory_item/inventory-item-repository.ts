import { DB } from "../../db/database";
import type { Database as DatabaseType } from "better-sqlite3";

export class InventoryItemRepository {
    private get db() {
        return DB.getConnection();
    }

    public getTotalAmount(userId: number, productId: number): number {
        const result = this.db.prepare(`
            SELECT SUM(quantity) as total 
            FROM inventory_items 
            WHERE user_id = ? AND product_id = ?
        `).get(userId, productId) as { total: number | null };

        return result?.total || 0;
    }
}
