import { RecipeRepository, Recipe, RecipeIngredient } from "./recipe-repository";
import { InventoryItemRepository } from "../inventory_item/inventory-item-repository";
import { ShoppingListItemRepository } from "../shopping_list_item/shopping-list-item-repository";
import { Unit } from "../../db/unit";

export interface RecipeWithIngredients extends Recipe {
    ingredients: RecipeIngredient[];
}

export class RecipeService {
    private recipeRepo = new RecipeRepository();

    public createRecipe(userId: number, title: string, instructions: string, ingredients: Array<{ productId: number, quantity: number }>): number {
        const unit = new Unit(false);
        try {
            const recipeId = this.recipeRepo.create(unit, { user_id: userId, title, instructions });

            for (const ingredient of ingredients) {
                this.recipeRepo.addIngredient(unit, recipeId, ingredient.productId, ingredient.quantity);
            }

            unit.complete(true);
            return recipeId;
        } catch (error) {
            unit.complete(false);
            throw error;
        }
    }

    public getRecipeById(recipeId: number): RecipeWithIngredients | null {
        const unit = new Unit(true);
        try {
            const recipe = this.recipeRepo.findById(unit, recipeId);
            if (!recipe) {
                unit.complete();
                return null;
            }

            const ingredients = this.recipeRepo.getIngredientsForRecipe(unit, recipeId);
            unit.complete();
            return { ...recipe, ingredients };
        } catch (error) {
            unit.complete();
            throw error;
        }
    }

    public getRecipesByUser(userId: number): Recipe[] {
        const unit = new Unit(true);
        try {
            const recipes = this.recipeRepo.findByUserId(unit, userId);
            unit.complete();
            return recipes;
        } catch (error) {
            unit.complete();
            throw error;
        }
    }

    public updateRecipe(recipeId: number, updates: Partial<Recipe>): void {
        const unit = new Unit(false);
        try {
            this.recipeRepo.update(unit, recipeId, updates);
            unit.complete(true);
        } catch (error) {
            unit.complete(false);
            throw error;
        }
    }

    public deleteRecipe(recipeId: number): void {
        const unit = new Unit(false);
        try {
            this.recipeRepo.delete(unit, recipeId);
            unit.complete(true);
        } catch (error) {
            unit.complete(false);
            throw error;
        }
    }

    public addIngredientToRecipe(recipeId: number, productId: number, quantity: number): void {
        const unit = new Unit(false);
        try {
            this.recipeRepo.addIngredient(unit, recipeId, productId, quantity);
            unit.complete(true);
        } catch (error) {
            unit.complete(false);
            throw error;
        }
    }

    public removeIngredientFromRecipe(recipeId: number, productId: number): void {
        const unit = new Unit(false);
        try {
            this.recipeRepo.removeIngredient(unit, recipeId, productId);
            unit.complete(true);
        } catch (error) {
            unit.complete(false);
            throw error;
        }
    }

    public updateIngredientQuantity(recipeId: number, productId: number, quantity: number): void {
        const unit = new Unit(false);
        try {
            this.recipeRepo.updateIngredientQuantity(unit, recipeId, productId, quantity);
            unit.complete(true);
        } catch (error) {
            unit.complete(false);
            throw error;
        }
    }

    public addMissingIngredientsToShoppingList(recipeId: number, userId: number): void {
        const unit = new Unit(false);
        try {
            const neededIngredients = this.recipeRepo.getIngredientsForRecipe(unit, recipeId);

            for (const item of neededIngredients) {
                const amountInFridge = InventoryItemRepository.getTotalAmount(userId, item.product_id);

                if (amountInFridge < item.quantity) {
                    const missingAmount = item.quantity - amountInFridge;
                    ShoppingListItemRepository.addItem(userId, item.product_id, recipeId, missingAmount);
                }
            }

            unit.complete(true);
        } catch (error) {
            unit.complete(false);
            throw error;
        }
    }

    public getRecipesSuggestedByInventory(userId: number): RecipeWithIngredients[] {
        const unit = new Unit(true);
        try {
            const userRecipes = this.recipeRepo.findByUserId(unit, userId);
            const suggestions: RecipeWithIngredients[] = [];

            for (const recipe of userRecipes) {
                const ingredients = this.recipeRepo.getIngredientsForRecipe(unit, recipe.recipe_id!);
                let canMake = true;

                for (const ingredient of ingredients) {
                    const available = InventoryItemRepository.getTotalAmount(userId, ingredient.product_id);
                    if (available < ingredient.quantity) {
                        canMake = false;
                        break;
                    }
                }

                if (canMake) {
                    suggestions.push({ ...recipe, ingredients });
                }
            }

            unit.complete();
            return suggestions;
        } catch (error) {
            unit.complete();
            throw error;
        }
    }
}
