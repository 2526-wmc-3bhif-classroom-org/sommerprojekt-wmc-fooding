import { authService } from './auth'

const API_URL = `${import.meta.env.VITE_API_URL}/ai`

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authService.getToken()}`
  }
}

function getDietPrefs(): string[] {
  try {
    const stored = localStorage.getItem('fooding_diet_prefs')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export async function extractExpiryDate(imageBase64: string): Promise<string | null> {
  const response = await fetch(`${API_URL}/extract-expiry`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ imageBase64 })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as any
    throw new Error(err.message || 'Fehler beim Scannen')
  }

  const data = await response.json()
  return data.date
}

export interface AiRecipeSuggestion {
  title: string
  instructions: string
  ingredients: string[]
}

export async function generateRecipeSuggestions(
  inventoryNames: string[],
  preferences: string
): Promise<AiRecipeSuggestion[]> {
  const response = await fetch(`${API_URL}/recipe-suggestions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ inventoryNames, preferences, dietPrefs: getDietPrefs() })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as any
    throw new Error(err.message || 'OpenAI API Fehler')
  }

  return response.json()
}

export interface RecipeWishResult {
  title: string
  instructions: string
  ingredients: { name: string; quantity: number; unit: string; category: string }[]
}

export async function generateRecipeWish(wish: string): Promise<RecipeWishResult> {
  const response = await fetch(`${API_URL}/recipe-wish`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ wish, dietPrefs: getDietPrefs() })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as any
    throw new Error(err.message || 'OpenAI API Fehler')
  }

  return response.json()
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = (reader.result as string).split(',')[1]
      if (result) resolve(result)
      else reject(new Error('Bild konnte nicht gelesen werden'))
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
