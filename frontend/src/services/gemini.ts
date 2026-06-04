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
