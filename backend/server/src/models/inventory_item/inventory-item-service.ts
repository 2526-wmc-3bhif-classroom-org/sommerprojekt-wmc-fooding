import { InventoryItemRepository, InventoryItem } from "./inventory-item-repository";

export class InventoryItemService {
    public static getInventoryByUserId(userId: number): { success: boolean; items?: InventoryItem[]; message?: string } {
        try {
            const items = InventoryItemRepository.findAllByUserId(userId);
            return { success: true, items };
        } catch (error) {
            console.error("Error fetching inventory:", error);
            return { success: false, message: "Failed to fetch inventory" };
        }
    }

    public static addInventoryItem(item: InventoryItem): { success: boolean; inventory_id?: number; message?: string } {
        if (!item.product_id || item.quantity <= 0 || !item.expiration_date) {
            return { success: false, message: "Invalid item data" };
        }

        try {
            const inventory_id = InventoryItemRepository.create(item);
            return { success: true, inventory_id };
        } catch (error) {
            console.error("Error creating inventory item:", error);
            return { success: false, message: "Failed to create inventory item" };
        }
    }

    public static updateInventoryItem(item: InventoryItem): { success: boolean; message?: string } {
        if (item.quantity < 0 || !item.expiration_date) {
            return { success: false, message: "Invalid update data" };
        }

        try {
            const updated = InventoryItemRepository.update(item);
            if (!updated) {
                return { success: false, message: "Item not found or unauthorized" };
            }
            return { success: true };
        } catch (error) {
            console.error("Error updating inventory item:", error);
            return { success: false, message: "Failed to update inventory item" };
        }
    }

    public static deleteInventoryItem(inventory_id: number, userId: number): { success: boolean; message?: string } {
        try {
            const deleted = InventoryItemRepository.delete(inventory_id, userId);
            if (!deleted) {
                return { success: false, message: "Item not found or unauthorized" };
            }
            return { success: true };
        } catch (error) {
            console.error("Error deleting inventory item:", error);
            return { success: false, message: "Failed to delete inventory item" };
        }
    }

    public static updateItemImage(inventory_id: number, userId: number, imagePath: string): { success: boolean; message?: string } {
        try {
            const updated = InventoryItemRepository.updateImage(inventory_id, userId, imagePath);
            if (!updated) {
                return { success: false, message: "Item not found or unauthorized" };
            }
            return { success: true };
        } catch (error) {
            console.error("Error updating item image:", error);
            return { success: false, message: "Failed to update image" };
        }
    }
}
