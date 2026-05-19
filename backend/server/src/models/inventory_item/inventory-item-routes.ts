import * as express from "express";
import { StatusCodes } from "http-status-codes";
import { InventoryItemService } from "./inventory-item-service";
import { isAuthenticated, AuthRequest } from "../../middleware/auth-handlers";
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

export const inventoryRouter = express.Router();

inventoryRouter.use(isAuthenticated);

inventoryRouter.get("/", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const result = InventoryItemService.getInventoryByUserId(userId);
    if (result.success) {
        res.status(StatusCodes.OK).json({ items: result.items });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: result.message });
    }
});

inventoryRouter.post("/", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const { product_id, quantity, expiration_date, location } = req.body;

    const result = InventoryItemService.addInventoryItem({
        user_id: userId,
        product_id,
        quantity,
        expiration_date,
        location
    });

    if (result.success) {
        res.status(StatusCodes.CREATED).json({ inventory_id: result.inventory_id, message: "Artikel hinzugefügt" });
    } else {
        const status = result.message === "Invalid item data" ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
        res.status(status).json({ message: result.message });
    }
});

inventoryRouter.put("/:id", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const inventory_id = parseInt(req.params.id as string);
    const { quantity, expiration_date, location } = req.body;

    const result = InventoryItemService.updateInventoryItem({
        inventory_id,
        user_id: userId,
        product_id: 0,
        quantity,
        expiration_date,
        location
    });

    if (result.success) {
        res.status(StatusCodes.OK).json({ message: "Aktualisiert" });
    } else {
        const status = result.message?.includes("not found") ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR;
        res.status(status).json({ message: result.message });
    }
});

inventoryRouter.delete("/:id", (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const inventory_id = parseInt(req.params.id as string);

    const result = InventoryItemService.deleteInventoryItem(inventory_id, userId);
    if (result.success) {
        res.status(StatusCodes.OK).json({ message: "Gelöscht" });
    } else {
        const status = result.message?.includes("not found") ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR;
        res.status(status).json({ message: result.message });
    }
});

inventoryRouter.put("/:id/image", upload.single('image'), (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const inventory_id = parseInt(req.params.id as string);

    if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Kein Bild hochgeladen" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const result = InventoryItemService.updateItemImage(inventory_id, userId, imagePath);
    if (result.success) {
        res.status(StatusCodes.OK).json({ message: "Bild aktualisiert", image: imagePath });
    } else {
        const status = result.message?.includes("not found") ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR;
        res.status(status).json({ message: result.message });
    }
});
