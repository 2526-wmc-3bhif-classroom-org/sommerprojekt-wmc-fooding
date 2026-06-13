import * as express from 'express'
import { StatusCodes } from 'http-status-codes'
import { isAuthenticated } from '../../middleware/auth-handlers'

export const aiRouter = express.Router()

aiRouter.use(isAuthenticated)

async function callOpenAI(body: object): Promise<any> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OpenAI API Key nicht konfiguriert')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({})) as any
        throw new Error(err.error?.message || 'OpenAI API Fehler')
    }

    return response.json()
}

aiRouter.post('/extract-expiry', async (req, res) => {
    try {
        const { imageBase64 } = req.body
        if (!imageBase64) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Kein Bild übergeben' })
        }

        const data = await callOpenAI({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: [
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
                    { type: 'text', text: 'Find the expiration date or best-before date in this image. Return ONLY the date in YYYY-MM-DD format. If multiple dates exist, return the one that is most likely the expiration date. If no date is found, return the word null.' }
                ]
            }],
            max_tokens: 50
        })

        const text: string = data.choices?.[0]?.message?.content?.trim() ?? ''
        if (!text || text === 'null') return res.json({ date: null })
        const match = text.match(/\d{4}-\d{2}-\d{2}/)
        res.json({ date: match ? match[0] : null })
    } catch (error: any) {
        console.error('AI extract-expiry error:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || 'Fehler beim Scannen' })
    }
})

aiRouter.post('/recipe-suggestions', async (req, res) => {
    try {
        const { inventoryNames, preferences, dietPrefs } = req.body
        if (!inventoryNames || inventoryNames.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Inventar ist leer' })
        }

        const inventoryList = (inventoryNames as string[]).join(', ')
        const prefLine = preferences?.trim() ? `\nZusätzliche Wünsche: ${preferences.trim()}` : ''
        const dietLine = (dietPrefs as string[])?.length > 0
            ? `\nErnährungspräferenzen des Users: ${(dietPrefs as string[]).join(', ')}. Bitte berücksichtigen.`
            : ''

        const data = await callOpenAI({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: `Du bist ein Kochassistent. Der User hat folgende Zutaten im Vorrat: ${inventoryList}.${prefLine}${dietLine}\n\nSchlage 3 Rezepte vor die mit diesen Zutaten (oder einem Teil davon) gekocht werden können. Antworte NUR mit einem JSON-Array ohne Markdown:\n[\n  {\n    "title": "Rezeptname",\n    "ingredients": ["Zutat 1", "Zutat 2"],\n    "instructions": "Schritt-für-Schritt Zubereitung"\n  }\n]`
            }],
            max_tokens: 1500
        })

        const text: string = data.choices?.[0]?.message?.content?.trim() ?? ''
        const json = text.replace(/```json|```/g, '').trim()
        res.json(JSON.parse(json))
    } catch (error: any) {
        console.error('AI recipe-suggestions error:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || 'OpenAI Fehler' })
    }
})

aiRouter.post('/recipe-wish', async (req, res) => {
    try {
        const { wish, dietPrefs } = req.body
        if (!wish) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Kein Wunsch angegeben' })
        }

        const dietLine = (dietPrefs as string[])?.length > 0
            ? `\nErnährungspräferenzen des Users: ${(dietPrefs as string[]).join(', ')}. Bitte berücksichtigen.`
            : ''

        const data = await callOpenAI({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: `Der User möchte folgendes kochen: "${wish}"${dietLine}\n\nErstelle ein konkretes Rezept dazu. Antworte NUR mit JSON ohne Markdown:\n{\n  "title": "Rezeptname",\n  "instructions": "Schritt-für-Schritt Zubereitung",\n  "ingredients": [\n    { "name": "Zutat", "quantity": 200, "unit": "g", "category": "Fleisch & Fisch" }\n  ]\n}\n\nMögliche Kategorien: Obst & Gemüse, Milchprodukte, Fleisch & Fisch, Getränke, Konserven, Backwaren, Snacks, Tiefkühl. Verwende sinnvolle Mengenangaben.`
            }],
            max_tokens: 1000
        })

        const text: string = data.choices?.[0]?.message?.content?.trim() ?? ''
        const json = text.replace(/```json|```/g, '').trim()
        res.json(JSON.parse(json))
    } catch (error: any) {
        console.error('AI recipe-wish error:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || 'OpenAI Fehler' })
    }
})
