const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

export async function extractExpiryDate(imageBase64: string): Promise<string | null> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            text: 'Find the expiration date or best-before date in this image. Return ONLY the date in YYYY-MM-DD format. If multiple dates exist, return the one that is most likely the expiration date. If no date is found, return the word null.'
          }
        ]
      }]
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || 'Gemini API Fehler')
  }

  const data = await response.json()
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

  if (!text || text === 'null') return null

  const match = text.match(/\d{4}-\d{2}-\d{2}/)
  return match ? match[0] : null
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
