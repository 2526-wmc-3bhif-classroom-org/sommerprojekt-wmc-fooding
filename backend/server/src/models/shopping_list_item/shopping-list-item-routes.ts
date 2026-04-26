import * as express from "express";
import { StatusCodes } from "http-status-codes";
import { ShoppingListItemRepository } from "./shopping-list-item-repository";
import { isAuthenticated, AuthRequest } from "../../middleware/auth-handlers";

export const shoppingListRouter = express.Router();

shoppingListRouter.use(isAuthenticated);

shoppingListRouter.get("/", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    try {
        const items = ShoppingListItemRepository.findAllByUserId(userId);
        res.status(StatusCodes.OK).json({ items });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Fehler beim Laden der Einkaufsliste" });
    }
});

shoppingListRouter.post("/", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const { product_id, recipe_id, quantity } = req.body;

    if (!product_id || !quantity) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Fehlende Daten" });
    }

    try {
        const shopping_item_id = ShoppingListItemRepository.create({
            user_id: userId,
            product_id,
            recipe_id: recipe_id ?? null,
            quantity
        });
        res.status(StatusCodes.CREATED).json({ shopping_item_id, message: "Artikel hinzugefügt" });
    } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Fehler beim Hinzufügen: " + error.message });
    }
});

