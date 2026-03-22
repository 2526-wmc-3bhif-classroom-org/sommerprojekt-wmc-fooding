import { DB } from "../../db/database";
import type { Database as DatabaseType } from "better-sqlite3";

export class ShoppingListItemRepository {
    private db: DatabaseType;

    constructor() {
        this.db = DB.createDBConnection();
    }


    public addItem(userId: number, productId: number, recipeId: number, quantity: number): void {
        this.db.prepare(`
            INSERT INTO shopping_list_items (user_id, product_id, recipe_id, quantity, checked)
            VALUES (?, ?, ?, ?, 0)
        `).run(userId, productId, recipeId, quantity);
    }
}
