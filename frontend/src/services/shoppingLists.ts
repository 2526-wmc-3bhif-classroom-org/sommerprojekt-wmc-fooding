import { authService } from './auth'
import { productService } from './product'

export interface ShoppingListItem {
  shopping_item_id?: number
  user_id?: number
  product_id: number
  recipe_id?: number | null
  quantity: number
  checked?: number
  product_name?: string
  default_unit?: string
  category?: string
}

const API_URL = 'http://127.0.0.1:3000/shopping-list'

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authService.getToken()}`
  }
}

export const shoppingListService = {
  async getItems(): Promise<ShoppingListItem[]> {
    const response = await fetch(API_URL, {
      headers: authHeaders()
    })
    if (!response.ok) throw new Error('Fehler beim Laden der Einkaufsliste')
    const data = await response.json()
    return data.items
  },

  async addItem(item: { product_id: number; quantity: number; recipe_id?: number | null }): Promise<{ shopping_item_id: number }> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(item)
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'Fehler beim Hinzufügen')
    }
    return response.json()
  },

  async updateQuantity(id: number, quantity: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ quantity })
    })
    if (!response.ok) throw new Error('Fehler beim Aktualisieren der Menge')
  },

  async setChecked(id: number, checked: boolean): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ checked })
    })
    if (!response.ok) throw new Error('Fehler beim Abhaken')
  },

  async deleteItem(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    if (!response.ok) throw new Error('Fehler beim Löschen')
  },

  // Mithilfe von KI
  async findOrCreateProduct(name: string, unit: string, category: string): Promise<number> {
    const products = await productService.getProducts()
    const existing = products.find(
      p => p.name.toLowerCase() === name.toLowerCase()
    )
    if (existing && existing.product_id != null) return existing.product_id
    const created = await productService.createProduct(name, unit || 'Stk', category || undefined)
    return created.product_id
  }
}
