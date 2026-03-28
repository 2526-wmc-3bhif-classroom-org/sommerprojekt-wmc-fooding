import { Unit } from "../../db/unit";
// Made the file so that sql injections are prevented
export interface Recipe {
    recipe_id?: number;
    user_id: number;
    title: string;
    instructions: string;
}

export interface RecipeIngredient {
    product_id: number;
    quantity: number;
    name?: string;
    default_unit?: string;
}

export class RecipeRepository {
    public create(unit: Unit, recipe: Recipe): number {
        unit.prepare(`
            INSERT INTO recipes (user_id, title, instructions)
            VALUES (?, ?, ?)
        `).run();
        
        const recipeId = unit.getLastRowId();
        return recipeId;
    }

    public findById(unit: Unit, recipeId: number): Recipe | undefined {
        return unit.prepare<Recipe>(`
            SELECT recipe_id, user_id, title, instructions
            FROM recipes
            WHERE recipe_id = ?
        `, { recipeId }).get();
    }

    public findByUserId(unit: Unit, userId: number): Recipe[] {
        return unit.prepare<Recipe>(`
            SELECT recipe_id, user_id, title, instructions
            FROM recipes
            WHERE user_id = ?
            ORDER BY title
        `, { userId }).all();
    }

    public update(unit: Unit, recipeId: number, recipe: Partial<Recipe>): void {
        const updates: string[] = [];
        const params: any = { recipeId };

        if (recipe.title !== undefined) {
            updates.push("title = $title");
            params.title = recipe.title;
        }
        if (recipe.instructions !== undefined) {
            updates.push("instructions = $instructions");
            params.instructions = recipe.instructions;
        }

        if (updates.length === 0) return;

        unit.prepare(`
            UPDATE recipes 
            SET ${updates.join(", ")}
            WHERE recipe_id = $recipeId
        `, params).run();
    }

    public delete(unit: Unit, recipeId: number): void {
        unit.prepare(`
            DELETE FROM recipes WHERE recipe_id = ?
        `, { recipeId }).run();
    }

    public getIngredientsForRecipe(unit: Unit, recipeId: number): RecipeIngredient[] {
        return unit.prepare<RecipeIngredient>(`
            SELECT ri.product_id, ri.quantity, p.name, p.default_unit
            FROM recipe_ingredients ri
            JOIN products p ON ri.product_id = p.product_id
            WHERE ri.recipe_id = ?
        `, { recipeId }).all();
    }

    public addIngredient(unit: Unit, recipeId: number, productId: number, quantity: number): void {
        unit.prepare(`
            INSERT INTO recipe_ingredients (recipe_id, product_id, quantity)
            VALUES (?, ?, ?)
        `, { recipeId, productId, quantity }).run();
    }

    public removeIngredient(unit: Unit, recipeId: number, productId: number): void {
        unit.prepare(`
            DELETE FROM recipe_ingredients 
            WHERE recipe_id = ? AND product_id = ?
        `, { recipeId, productId }).run();
    }

    public updateIngredientQuantity(unit: Unit, recipeId: number, productId: number, quantity: number): void {
        unit.prepare(`
            UPDATE recipe_ingredients 
            SET quantity = ?
            WHERE recipe_id = ? AND product_id = ?
        `, { quantity, recipeId, productId }).run();
    }
}
