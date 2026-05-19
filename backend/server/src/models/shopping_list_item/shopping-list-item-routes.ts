import * as express from "express";
import { StatusCodes } from "http-status-codes";
import { ShoppingListItemService } from "./shopping-list-item-service";
import { isAuthenticated, AuthRequest } from "../../middleware/auth-handlers";

export const shoppingListRouter = express.Router();

shoppingListRouter.use(isAuthenticated);

shoppingListRouter.get("/", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const result = ShoppingListItemService.getItemsByUserId(userId);
    if (result.success) {
        res.status(StatusCodes.OK).json({ items: result.items });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: result.message });
    }
});

shoppingListRouter.post("/", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const { product_id, recipe_id, quantity } = req.body;

    const result = ShoppingListItemService.addItem({
        user_id: userId,
        product_id,
        recipe_id: recipe_id ?? null,
        quantity
    });

    if (result.success) {
        res.status(StatusCodes.CREATED).json({ shopping_item_id: result.shopping_item_id, message: "Artikel hinzugefügt" });
    } else {
        const status = result.message === "Invalid item data" ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
        res.status(status).json({ message: result.message });
    }
});

shoppingListRouter.put("/:id", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const shopping_item_id = parseInt(req.params.id as string);
    const { quantity, checked } = req.body;

    let result: { success: boolean; message?: string };

    if (checked !== undefined) {
        result = ShoppingListItemService.setItemChecked(shopping_item_id, userId, Boolean(checked));
    } else if (quantity !== undefined) {
        result = ShoppingListItemService.updateItemQuantity(shopping_item_id, userId, quantity);
    } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Fehlende Daten" });
    }

    if (result.success) {
        res.status(StatusCodes.OK).json({ message: "Aktualisiert" });
    } else {
        const status = result.message?.includes("not found") ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR;
        res.status(status).json({ message: result.message });
    }
});

shoppingListRouter.delete("/:id", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const shopping_item_id = parseInt(req.params.id as string);

    const result = ShoppingListItemService.deleteItem(shopping_item_id, userId);
    if (result.success) {
        res.status(StatusCodes.OK).json({ message: "Gelöscht" });
    } else {
        const status = result.message?.includes("not found") ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR;
        res.status(status).json({ message: result.message });
    }
});
