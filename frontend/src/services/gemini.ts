const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

export async function extractExpiryDate(imageBase64: string): Promise<string | null> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
          },
          {
            type: 'text',
            text: 'Find the expiration date or best-before date in this image. Return ONLY the date in YYYY-MM-DD format. If multiple dates exist, return the one that is most likely the expiration date. If no date is found, return the word null.'
          }
        ]
      }],
      max_tokens: 50
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || 'OpenAI API Fehler')
  }

  const data = await response.json()
  const text: string = data.choices?.[0]?.message?.content?.trim() ?? ''

  if (!text || text === 'null') return null

  const match = text.match(/\d{4}-\d{2}-\d{2}/)
  return match ? match[0] : null
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
  const inventoryList = inventoryNames.join(', ')
  const prefLine = preferences.trim() ? `\nZusätzliche Wünsche: ${preferences.trim()}` : ''

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Du bist ein Kochassistent. Der User hat folgende Zutaten im Vorrat: ${inventoryList}.${prefLine}\n\nSchlage 3 Rezepte vor die mit diesen Zutaten (oder einem Teil davon) gekocht werden können. Antworte NUR mit einem JSON-Array ohne Markdown:\n[\n  {\n    "title": "Rezeptname",\n    "ingredients": ["Zutat 1", "Zutat 2"],\n    "instructions": "Schritt-für-Schritt Zubereitung"\n  }\n]`
      }],
      max_tokens: 1500
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || 'OpenAI API Fehler')
  }

  const data = await response.json()
  const text: string = data.choices?.[0]?.message?.content?.trim() ?? ''
  const json = text.replace(/```json|```/g, '').trim()
  return JSON.parse(json) as AiRecipeSuggestion[]
}

export interface RecipeWishResult {
  title: string
  instructions: string
  ingredients: { name: string; quantity: number; unit: string; category: string }[]
}

export async function generateRecipeWish(wish: string): Promise<RecipeWishResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Der User möchte folgendes kochen: "${wish}"\n\nErstelle ein konkretes Rezept dazu. Antworte NUR mit JSON ohne Markdown:\n{\n  "title": "Rezeptname",\n  "instructions": "Schritt-für-Schritt Zubereitung",\n  "ingredients": [\n    { "name": "Zutat", "quantity": 200, "unit": "g", "category": "Fleisch & Fisch" }\n  ]\n}\n\nMögliche Kategorien: Obst & Gemüse, Milchprodukte, Fleisch & Fisch, Getränke, Konserven, Backwaren, Snacks, Tiefkühl. Verwende sinnvolle Mengenangaben.`
      }],
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || 'OpenAI API Fehler')
  }

  const data = await response.json()
  const text: string = data.choices?.[0]?.message?.content?.trim() ?? ''
  const json = text.replace(/```json|```/g, '').trim()
  return JSON.parse(json) as RecipeWishResult
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
