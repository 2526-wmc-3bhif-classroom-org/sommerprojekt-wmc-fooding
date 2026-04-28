import { DB } from '../src/db/database';
import { ProductRepository } from '../src/models/product/product-repository';

describe('ProductRepository', () => {
    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
        DB.closeConnection();
    });

    it('should create a product, find it by id, and update it', () => {
        const productId = ProductRepository.create('Apple', 'kg', 'Fruits');
        expect(productId).toBeGreaterThan(0);

        const product = ProductRepository.findById(productId);
        expect(product).toBeDefined();
        expect(product?.name).toBe('Apple');
        expect(product?.default_unit).toBe('kg');
        expect(product?.category).toBe('Fruits');

        const allProducts = ProductRepository.findAll();
        expect(allProducts).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    product_id: productId,
                    name: 'Apple',
                    default_unit: 'kg',
                    category: 'Fruits'
                })
            ])
        );

        const updated = ProductRepository.update(productId, 'Pear', 'kg', 'Fruits');
        expect(updated).toBe(true);

        const updatedProduct = ProductRepository.findById(productId);
        expect(updatedProduct?.name).toBe('Pear');
        expect(updatedProduct?.default_unit).toBe('kg');
    });
});
