import { RecipeRepository } from "./recipe-repository";
import { InventoryItemRepository } from "../inventory_item/inventory-item-repository";
import { ShoppingListItemRepository } from "../shopping_list_item/shopping-list-item-repository";

export class RecipeService {
    private recipeRepo = new RecipeRepository();
    private inventoryRepo = new InventoryItemRepository();
    private shoppingRepo = new ShoppingListItemRepository();


    public async addMissingIngredientsToShoppingList(recipeId: number, userId: number): Promise<void> {
        const neededIngredients = this.recipeRepo.getIngredientsForRecipe(recipeId);

        for (const item of neededIngredients) {
            const amountInFridge = this.inventoryRepo.getTotalAmount(userId, item.product_id);

            if (amountInFridge < item.quantity) {
                const missingAmount = item.quantity - amountInFridge;
                
                this.shoppingRepo.addItem(userId, item.product_id, recipeId, missingAmount);
            }
        }
    }
}
