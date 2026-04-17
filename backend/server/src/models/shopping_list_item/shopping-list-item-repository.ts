import { DB } from "../../db/database";

export class ShoppingListItemRepository {
    private static get db() {
        return DB.getConnection();
    }

    public static addItem(userId: number, productId: number, recipeId: number, quantity: number): void {
        this.db.prepare(`
            INSERT INTO shopping_list_items (user_id, product_id, recipe_id, quantity, checked)
            VALUES (?, ?, ?, ?, 0)
        `).run(userId, productId, recipeId, quantity);
    }
}
