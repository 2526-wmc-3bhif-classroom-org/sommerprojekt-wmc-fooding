import { DB } from '../src/db/database';
import { ProductService } from '../src/models/product/product-service';

describe('ProductService', () => {
    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    afterAll(() => {
        DB.closeConnection();
    });

    describe('createProduct', () => {
        it('should return error if name is missing or empty', () => {
            const res1 = ProductService.createProduct('', 'kg');
            expect(res1.success).toBe(false);
            expect(res1.message).toBe('Product name is required');

            const res2 = ProductService.createProduct('   ', 'kg');
            expect(res2.success).toBe(false);
            expect(res2.message).toBe('Product name is required');
        });

        it('should return error if default unit is missing or empty', () => {
            const res1 = ProductService.createProduct('Pear', '');
            expect(res1.success).toBe(false);
            expect(res1.message).toBe('Default unit is required');

            const res2 = ProductService.createProduct('Pear', '   ');
            expect(res2.success).toBe(false);
            expect(res2.message).toBe('Default unit is required');
        });

        it('should successfully create a valid product', () => {
            const res = ProductService.createProduct('Banana', 'Stk', 'Fruits');
            expect(res.success).toBe(true);
            expect(res.product_id).toBeGreaterThan(0);

            // Fetch to confirm
            const getRes = ProductService.getProductById(res.product_id!);
            expect(getRes.success).toBe(true);
            expect(getRes.product?.name).toBe('Banana');
            expect(getRes.product?.default_unit).toBe('Stk');
            expect(getRes.product?.category).toBe('Fruits');
        });
    });

    describe('updateProduct', () => {
        it('should validate inputs before updating', () => {
            const res1 = ProductService.updateProduct(1, '', 'kg');
            expect(res1.success).toBe(false);
            expect(res1.message).toBe('Product name is required');

            const res2 = ProductService.updateProduct(1, 'Apple', '');
            expect(res2.success).toBe(false);
            expect(res2.message).toBe('Default unit is required');
        });

        it('should return error if product to update does not exist', () => {
            const res = ProductService.updateProduct(9999, 'Pear', 'kg', 'Fruits');
            expect(res.success).toBe(false);
            expect(res.message).toBe('Product not found');
        });
    });

    describe('deleteProduct', () => {
        it('should return error if product to delete does not exist', () => {
            const res = ProductService.deleteProduct(9999);
            expect(res.success).toBe(false);
            expect(res.message).toBe('Product not found');
        });
    });
});
