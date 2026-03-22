import { DB } from "../../db/database";
import type { Database as DatabaseType } from "better-sqlite3";

export interface RecipeIngredient {
    product_id: number;
    quantity: number;
}

export class RecipeRepository {
    private db: DatabaseType;

    constructor() {
        this.db = DB.createDBConnection();
    }


    public getIngredientsForRecipe(recipeId: number): RecipeIngredient[] {
        return this.db.prepare(`
            SELECT product_id, quantity 
            FROM recipe_ingredients 
            WHERE recipe_id = ?
        `).all(recipeId) as RecipeIngredient[];
    }
}
