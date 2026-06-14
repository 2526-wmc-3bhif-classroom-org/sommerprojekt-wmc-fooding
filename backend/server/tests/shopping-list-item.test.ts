import { DB } from '../src/db/database';
import { ShoppingListItemRepository } from '../src/models/shopping_list_item/shopping-list-item-repository';
import { ShoppingListItemService } from '../src/models/shopping_list_item/shopping-list-item-service';
import { UserRepository } from '../src/models/user/user-repository';
import { ProductRepository } from '../src/models/product/product-repository';

describe('ShoppingListItem Tests', () => {
    let userId: number;
    let productId: number;

    beforeAll(() => {
        process.env.NODE_ENV = 'test';
        
        // Seed a user and a product for testing (required due to foreign keys)
        userId = UserRepository.create({
            email: 'shopping@example.com',
            password_hash: 'hash',
            role: 'user'
        });
        
        productId = ProductRepository.create('Milk', 'Liter', 'Dairy');
    });

    afterAll(() => {
        DB.closeConnection();
    });

    describe('ShoppingListItemRepository', () => {
        it('should create a shopping list item and find it', () => {
            const itemId = ShoppingListItemRepository.create({
                user_id: userId,
                product_id: productId,
                quantity: 2
            });
            expect(itemId).toBeGreaterThan(0);

            const items = ShoppingListItemRepository.findAllByUserId(userId);
            expect(items.length).toBeGreaterThan(0);
            expect(items[0]).toEqual(
                expect.objectContaining({
                    shopping_item_id: itemId,
                    user_id: userId,
                    product_id: productId,
                    quantity: 2,
                    product_name: 'Milk',
                    default_unit: 'Liter',
                    category: 'Dairy',
                    checked: 0
                })
            );
        });

        it('should update a shopping list item quantity', () => {
            const items = ShoppingListItemRepository.findAllByUserId(userId);
            const itemId = items[0].shopping_item_id!;

            const updated = ShoppingListItemRepository.update(itemId, userId, 5);
            expect(updated).toBe(true);

            const updatedItems = ShoppingListItemRepository.findAllByUserId(userId);
            expect(updatedItems[0].quantity).toBe(5);
        });

        it('should set an item as checked', () => {
            const items = ShoppingListItemRepository.findAllByUserId(userId);
            const itemId = items[0].shopping_item_id!;

            const updated = ShoppingListItemRepository.setChecked(itemId, userId, true);
            expect(updated).toBe(true);

            const updatedItems = ShoppingListItemRepository.findAllByUserId(userId);
            expect(updatedItems[0].checked).toBe(1);
        });

        it('should delete checked items', () => {
            const deleted = ShoppingListItemRepository.deleteChecked(userId);
            expect(deleted).toBe(true);

            const items = ShoppingListItemRepository.findAllByUserId(userId);
            expect(items.length).toBe(0);
        });
    });

    describe('ShoppingListItemService', () => {
        it('should validate inputs during addItem', () => {
            const result = ShoppingListItemService.addItem({
                user_id: userId,
                product_id: 0, // invalid
                quantity: 2
            });
            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid item data');
        });

        it('should validate inputs during updateItemQuantity', () => {
            const result = ShoppingListItemService.updateItemQuantity(1, userId, -5);
            expect(result.success).toBe(false);
            expect(result.message).toBe('Quantity cannot be negative');
        });
    });
});
