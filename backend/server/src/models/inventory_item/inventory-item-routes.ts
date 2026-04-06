import * as express from "express";
import { StatusCodes } from "http-status-codes";
import { InventoryItemRepository } from "./inventory-item-repository";
import { isAuthenticated, AuthRequest } from "../../middleware/auth-handlers";

export const inventoryRouter = express.Router();

inventoryRouter.use(isAuthenticated);

inventoryRouter.get("/", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    try {
        const items = InventoryItemRepository.findAllByUserId(userId);
        res.status(StatusCodes.OK).json({ items });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Fehler beim Laden des Inventars" });
    }
});

inventoryRouter.post("/", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const { product_id, quantity, expiration_date, location } = req.body;

    if (!product_id || !quantity || !expiration_date) {
        console.warn("POST /inventory-items failed: missing data", { product_id, quantity, expiration_date });
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Fehlende Daten" });
    }

    try {
        const inventory_id = InventoryItemRepository.create({
            user_id: userId,
            product_id,
            quantity,
            expiration_date,
            location
        });
        res.status(StatusCodes.CREATED).json({ inventory_id, message: "Artikel hinzugefügt" });
    } catch (error: any) {
        console.error("POST /inventory-items failed with error:", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Fehler beim Hinzufügen: " + error.message });
    }
});

inventoryRouter.put("/:id", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const inventory_id = parseInt(req.params.id);
    const { quantity, expiration_date, location } = req.body;

    try {
        const success = InventoryItemRepository.update({
            inventory_id,
            user_id: userId,
            product_id: 0,
            quantity,
            expiration_date,
            location
        });
        if (success) {
            res.status(StatusCodes.OK).json({ message: "Aktualisiert" });
        } else {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Nicht gefunden" });
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Fehler beim Update" });
    }
});

inventoryRouter.delete("/:id", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const inventory_id = parseInt(req.params.id);

    try {
        const success = InventoryItemRepository.delete(inventory_id, userId);
        if (success) {
            res.status(StatusCodes.OK).json({ message: "Gelöscht" });
        } else {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Nicht gefunden" });
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Fehler beim Löschen" });
    }
});
