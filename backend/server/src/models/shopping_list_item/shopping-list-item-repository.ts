import { DB } from "../../db/database";

export interface ShoppingListItem {
    shopping_item_id?: number;
    user_id: number;
    product_id: number;
    recipe_id?: number | null;
    quantity: number;
    checked?: number;
    // Joined fields
    product_name?: string;
    default_unit?: string;
    category?: string;
}

export class ShoppingListItemRepository {
    private static get db() {
        return DB.getConnection();
    }

    public static findAllByUserId(userId: number): ShoppingListItem[] {
        return this.db.prepare(`
            SELECT s.*, p.name as product_name, p.default_unit, p.category
            FROM shopping_list_items s
            JOIN products p ON s.product_id = p.product_id
            WHERE s.user_id = ?
            ORDER BY s.checked ASC, s.shopping_item_id ASC
        `).all(userId) as ShoppingListItem[];
    }

    public static create(item: ShoppingListItem): number {
        const result = this.db.prepare(`
            INSERT INTO shopping_list_items (user_id, product_id, recipe_id, quantity, checked)
            VALUES (?, ?, ?, ?, 0)
        `).run(item.user_id, item.product_id, item.recipe_id ?? null, item.quantity);
        return result.lastInsertRowid as number;
    }

    public static update(shopping_item_id: number, userId: number, quantity: number): boolean {
        const result = this.db.prepare(`
            UPDATE shopping_list_items
            SET quantity = ?
            WHERE shopping_item_id = ? AND user_id = ?
        `).run(quantity, shopping_item_id, userId);
        return result.changes > 0;
    }

    public static setChecked(shopping_item_id: number, userId: number, checked: boolean): boolean {
        const result = this.db.prepare(`
            UPDATE shopping_list_items
            SET checked = ?
            WHERE shopping_item_id = ? AND user_id = ?
        `).run(checked ? 1 : 0, shopping_item_id, userId);
        return result.changes > 0;
    }

    public static delete(shopping_item_id: number, userId: number): boolean {
        const result = this.db.prepare(`
            DELETE FROM shopping_list_items
            WHERE shopping_item_id = ? AND user_id = ?
        `).run(shopping_item_id, userId);
        return result.changes > 0;
    }
}
