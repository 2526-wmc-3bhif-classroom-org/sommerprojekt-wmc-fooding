import { DB } from '../src/db/database';
import { InventoryItemRepository } from '../src/models/inventory_item/inventory-item-repository';
import { ProductRepository } from '../src/models/product/product-repository';
import { RecipeService } from '../src/models/recipe/recipe-service';
import { UserRepository } from '../src/models/user/user-repository';

describe('RecipeService', () => {
    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
        DB.closeConnection();
    });

    it('should suggest recipes only when inventory contains all required ingredients', () => {
        const userId = UserRepository.create({
            email: 'recipe@test.com',
            password_hash: 'testhash',
            role: 'user'
        });

        const appleId = ProductRepository.create('Apple', 'pcs', 'Fruit');
        const bananaId = ProductRepository.create('Banana', 'pcs', 'Fruit');

        const recipeService = new RecipeService();
        const recipeId = recipeService.createRecipe(userId, 'Fruit Salad', 'Cut fruit and mix together', [
            { productId: appleId, quantity: 2 },
            { productId: bananaId, quantity: 3 }
        ]);

        let suggestions = recipeService.getRecipesSuggestedByInventory(userId);
        expect(suggestions).toHaveLength(0);

        InventoryItemRepository.create({
            user_id: userId,
            product_id: appleId,
            quantity: 2,
            expiration_date: '2026-06-01'
        });

        InventoryItemRepository.create({
            user_id: userId,
            product_id: bananaId,
            quantity: 3,
            expiration_date: '2026-06-01'
        });

        suggestions = recipeService.getRecipesSuggestedByInventory(userId);

        expect(suggestions).toHaveLength(1);
        expect(suggestions[0].recipe_id).toBe(recipeId);
        expect(suggestions[0].title).toBe('Fruit Salad');
        expect(suggestions[0].ingredients).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ product_id: appleId, quantity: 2 }),
                expect.objectContaining({ product_id: bananaId, quantity: 3 })
            ])
        );
    });
});
