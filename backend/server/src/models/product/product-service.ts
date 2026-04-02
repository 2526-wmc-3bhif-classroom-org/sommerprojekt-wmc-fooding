import { ProductRepository, Product } from "./product-repository";

export class ProductService {
    public static createProduct(name: string, default_unit: string): { success: boolean; product_id?: number; message?: string } {
        if (!name || name.trim().length === 0) {
            return { success: false, message: "Product name is required" };
        }

        if (!default_unit || default_unit.trim().length === 0) {
            return { success: false, message: "Default unit is required" };
        }

        try {
            const product_id = ProductRepository.create(name.trim(), default_unit.trim());
            return { success: true, product_id };
        } catch (error) {
            console.error("Error creating product:", error);
            return { success: false, message: "Failed to create product" };
        }
    }

    public static getAllProducts(): { success: boolean; products?: Product[]; message?: string } {
        try {
            const products = ProductRepository.findAll();
            return { success: true, products };
        } catch (error) {
            console.error("Error fetching products:", error);
            return { success: false, message: "Failed to fetch products" };
        }
    }

    public static getProductById(product_id: number): { success: boolean; product?: Product; message?: string } {
        try {
            const product = ProductRepository.findById(product_id);
            if (!product) {
                return { success: false, message: "Product not found" };
            }
            return { success: true, product };
        } catch (error) {
            console.error("Error fetching product:", error);
            return { success: false, message: "Failed to fetch product" };
        }
    }

    public static updateProduct(product_id: number, name: string, default_unit: string): { success: boolean; message?: string } {
        if (!name || name.trim().length === 0) {
            return { success: false, message: "Product name is required" };
        }

        if (!default_unit || default_unit.trim().length === 0) {
            return { success: false, message: "Default unit is required" };
        }

        try {
            const updated = ProductRepository.update(product_id, name.trim(), default_unit.trim());
            if (!updated) {
                return { success: false, message: "Product not found" };
            }
            return { success: true };
        } catch (error) {
            console.error("Error updating product:", error);
            return { success: false, message: "Failed to update product" };
        }
    }

    public static deleteProduct(product_id: number): { success: boolean; message?: string } {
        try {
            const deleted = ProductRepository.delete(product_id);
            if (!deleted) {
                return { success: false, message: "Product not found" };
            }
            return { success: true };
        } catch (error) {
            console.error("Error deleting product:", error);
            return { success: false, message: "Failed to delete product" };
        }
    }
}
