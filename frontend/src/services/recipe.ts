import { authService } from './auth'

export interface Recipe {
  recipe_id?: number
  user_id?: number
  title: string
  instructions: string
}

export interface RecipeIngredient {
  product_id: number
  quantity: number
  name?: string
  default_unit?: string
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredient[]
}

const API_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000'}/recipes`

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authService.getToken()}`
  }
}

export const recipeService = {
  async getRecipes(): Promise<Recipe[]> {
    const response = await fetch(API_URL, { headers: authHeaders() })
    if (!response.ok) {
      if (response.status === 401) authService.handleUnauthorized()
      throw new Error('Fehler beim Laden der Rezepte')
    }
    return response.json()
  },

  async getRecipeById(id: number): Promise<RecipeWithIngredients> {
    const response = await fetch(`${API_URL}/${id}`, { headers: authHeaders() })
    if (!response.ok) {
      if (response.status === 401) authService.handleUnauthorized()
      throw new Error('Fehler beim Laden des Rezepts')
    }
    return response.json()
  },

  async getSuggestions(): Promise<RecipeWithIngredients[]> {
    const response = await fetch(`${API_URL}/suggestions`, { headers: authHeaders() })
    if (!response.ok) {
      if (response.status === 401) authService.handleUnauthorized()
      throw new Error('Fehler beim Laden der Vorschläge')
    }
    return response.json()
  },

  async createRecipe(
    title: string,
    instructions: string,
    ingredients: { productId: number; quantity: number }[]
  ): Promise<{ recipeId: number }> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title, instructions, ingredients })
    })
    if (!response.ok) {
      if (response.status === 401) authService.handleUnauthorized()
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'Fehler beim Erstellen')
    }
    return response.json()
  },

  async updateRecipe(id: number, data: Partial<Pick<Recipe, 'title' | 'instructions'>>): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      if (response.status === 401) authService.handleUnauthorized()
      throw new Error('Fehler beim Aktualisieren')
    }
  },

  async deleteRecipe(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    if (!response.ok) {
      if (response.status === 401) authService.handleUnauthorized()
      throw new Error('Fehler beim Löschen')
    }
  },

  async addIngredient(recipeId: number, productId: number, quantity: number): Promise<void> {
    const response = await fetch(`${API_URL}/${recipeId}/ingredients`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ productId, quantity })
    })
    if (!response.ok) {
      if (response.status === 401) authService.handleUnauthorized()
      throw new Error('Fehler beim Hinzufügen der Zutat')
    }
  },

  async removeIngredient(recipeId: number, productId: number): Promise<void> {
    const response = await fetch(`${API_URL}/${recipeId}/ingredients/${productId}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    if (!response.ok) {
      if (response.status === 401) authService.handleUnauthorized()
      throw new Error('Fehler beim Entfernen der Zutat')
    }
  },

  async updateIngredient(recipeId: number, productId: number, quantity: number): Promise<void> {
    const response = await fetch(`${API_URL}/${recipeId}/ingredients/${productId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ quantity })
    })
    if (!response.ok) {
      if (response.status === 401) authService.handleUnauthorized()
      throw new Error('Fehler beim Aktualisieren der Zutat')
    }
  },

  async addMissingToShoppingList(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}/shopping-list`, {
      method: 'POST',
      headers: authHeaders()
    })
    if (!response.ok) {
      if (response.status === 401) authService.handleUnauthorized()
      throw new Error('Fehler beim Hinzufügen zur Einkaufsliste')
    }
  }
}
