import { authService } from './auth';

export interface InventoryItem {
    inventory_id?: number;
    product_id: number;
    quantity: number;
    expiration_date: string;
    location?: string;
    product_name?: string;
    default_unit?: string;
    category?: string;
}

const API_URL = 'http://127.0.0.1:8080/inventory-items';

export const inventoryService = {
    async getInventory(): Promise<InventoryItem[]> {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Fehler beim Laden des Inventars');
        }

        const data = await response.json();
        return data.items;
    },

    async addItem(item: Partial<InventoryItem>): Promise<void> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Fehler beim Hinzufügen');
        }
    },

    async updateItem(id: number, item: Partial<InventoryItem>): Promise<void> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            throw new Error('Fehler beim Update');
        }
    },

    async deleteItem(id: number): Promise<void> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Fehler beim Löschen');
        }
    }
};
