import * as express from "express";
import { StatusCodes } from "http-status-codes";
import { ProductService } from "./product-service";
import { isAuthenticated } from "../../middleware/auth-handlers";

export const productRouter = express.Router();

productRouter.use(isAuthenticated);

productRouter.post("/", (req, res) => {
    const { name, default_unit, category } = req.body;

    if (!name || !default_unit) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            message: "Name and default_unit are required" 
        });
    }

    const result = ProductService.createProduct(name, default_unit, category);

    if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            message: result.message 
        });
    }

    res.status(StatusCodes.CREATED).json({
        product_id: result.product_id,
        message: "Product created successfully"
    });
});

productRouter.get("/", (req, res) => {
    const result = ProductService.getAllProducts();

    if (!result.success) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: result.message 
        });
    }

    res.status(StatusCodes.OK).json({
        products: result.products
    });
});

productRouter.get("/:id", (req, res) => {
    const product_id = parseInt(req.params.id as string);

    if (isNaN(product_id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            message: "Invalid product ID" 
        });
    }

    const result = ProductService.getProductById(product_id);

    if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
            message: result.message 
        });
    }

    res.status(StatusCodes.OK).json({
        product: result.product
    });
});

productRouter.put("/:id", (req, res) => {
    const product_id = parseInt(req.params.id as string);
    const { name, default_unit, category } = req.body;

    if (isNaN(product_id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            message: "Invalid product ID" 
        });
    }

    if (!name || !default_unit) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            message: "Name and default_unit are required" 
        });
    }

    const result = ProductService.updateProduct(product_id, name, default_unit, category);

    if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
            message: result.message 
        });
    }

    res.status(StatusCodes.OK).json({
        message: "Product updated successfully"
    });
});

productRouter.delete("/:id", (req, res) => {
    const product_id = parseInt(req.params.id as string);

    if (isNaN(product_id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            message: "Invalid product ID" 
        });
    }

    const result = ProductService.deleteProduct(product_id);

    if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
            message: result.message 
        });
    }

    res.status(StatusCodes.OK).json({
        message: "Product deleted successfully"
    });
});
