import { DB } from '../src/db/database';
import { InventoryItemRepository } from '../src/models/inventory_item/inventory-item-repository';
import { ProductRepository } from '../src/models/product/product-repository';
import { UserRepository } from '../src/models/user/user-repository';

describe('InventoryItemRepository', () => {
    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
        DB.closeConnection();
    });

    it('should calculate total amount correctly for the same product', () => {
        const userId = UserRepository.create({
            email: 'inventory@test.com',
            password_hash: 'testhash',
            role: 'user'
        });

        const productId = ProductRepository.create('Milk', 'liter', 'Dairy');

        InventoryItemRepository.create({
            user_id: userId,
            product_id: productId,
            quantity: 1.5,
            expiration_date: '2026-06-01',
            location: 'Fridge'
        });

        InventoryItemRepository.create({
            user_id: userId,
            product_id: productId,
            quantity: 2.5,
            expiration_date: '2026-06-05',
            location: 'Fridge'
        });

        const total = InventoryItemRepository.getTotalAmount(userId, productId);
        expect(total).toBe(4);
    });

    it('should delete inventory items when the related user is deleted', () => {
        const userId = UserRepository.create({
            email: 'cascade@test.com',
            password_hash: 'testhash',
            role: 'user'
        });

        const productId = ProductRepository.create('Bread', 'pcs', 'Bakery');

        InventoryItemRepository.create({
            user_id: userId,
            product_id: productId,
            quantity: 3,
            expiration_date: '2026-06-10',
            location: 'Pantry'
        });

        const deleteResult = DB.getConnection()
            .prepare('DELETE FROM users WHERE user_id = ?')
            .run(userId);

        expect(deleteResult.changes).toBe(1);

        const inventoryCountResult = DB.getConnection()
            .prepare('SELECT COUNT(*) as count FROM inventory_items WHERE user_id = ?')
            .get(userId) as { count: number };

        expect(inventoryCountResult.count).toBe(0);
    });
});
