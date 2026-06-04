import { ShoppingListItemRepository, ShoppingListItem } from "./shopping-list-item-repository";

export class ShoppingListItemService {
    public static getItemsByUserId(userId: number): { success: boolean; items?: ShoppingListItem[]; message?: string } {
        try {
            const items = ShoppingListItemRepository.findAllByUserId(userId);
            return { success: true, items };
        } catch (error) {
            console.error("Error fetching shopping list items:", error);
            return { success: false, message: "Failed to fetch shopping list items" };
        }
    }

    public static addItem(item: ShoppingListItem): { success: boolean; shopping_item_id?: number; message?: string } {
        if (!item.product_id || item.quantity <= 0) {
            return { success: false, message: "Invalid item data" };
        }

        try {
            const shopping_item_id = ShoppingListItemRepository.create(item);
            return { success: true, shopping_item_id };
        } catch (error) {
            console.error("Error creating shopping list item:", error);
            return { success: false, message: "Failed to create shopping list item" };
        }
    }

    public static updateItemQuantity(shopping_item_id: number, userId: number, quantity: number): { success: boolean; message?: string } {
        if (quantity < 0) {
            return { success: false, message: "Quantity cannot be negative" };
        }

        try {
            const updated = ShoppingListItemRepository.update(shopping_item_id, userId, quantity);
            if (!updated) {
                return { success: false, message: "Item not found or unauthorized" };
            }
            return { success: true };
        } catch (error) {
            console.error("Error updating shopping list item quantity:", error);
            return { success: false, message: "Failed to update item quantity" };
        }
    }

    public static setItemChecked(shopping_item_id: number, userId: number, checked: boolean): { success: boolean; message?: string } {
        try {
            const updated = ShoppingListItemRepository.setChecked(shopping_item_id, userId, checked);
            if (!updated) {
                return { success: false, message: "Item not found or unauthorized" };
            }
            return { success: true };
        } catch (error) {
            console.error("Error setting item checked state:", error);
            return { success: false, message: "Failed to update item state" };
        }
    }

    public static deleteItem(shopping_item_id: number, userId: number): { success: boolean; message?: string } {
        try {
            const deleted = ShoppingListItemRepository.delete(shopping_item_id, userId);
            if (!deleted) {
                return { success: false, message: "Item not found or unauthorized" };
            }
            return { success: true };
        } catch (error) {
            console.error("Error deleting shopping list item:", error);
            return { success: false, message: "Failed to delete item" };
        }
    }

    public static deleteCheckedItems(userId: number): { success: boolean; message?: string } {
        try {
            ShoppingListItemRepository.deleteChecked(userId);
            return { success: true };
        } catch (error) {
            console.error("Error deleting checked shopping list items:", error);
            return { success: false, message: "Failed to delete checked items" };
        }
    }
}
