import Anthropic from '@anthropic-ai/sdk'
import { RawArticle } from './fetchNews'
import { randomUUID } from 'crypto'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface CuratedArticle {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl: string
  publishedAt: string
  category: string
}

export async function curateAndSummarize(raw: RawArticle[]): Promise<CuratedArticle[]> {
  if (raw.length === 0) return []

  const articlesText = raw
    .map(
      (a, i) =>
        `[${i + 1}] TÍTULO: ${a.title}\nFUENTE: ${a.source}\nFECHA: ${a.pubDate}\nURL: ${a.link}\nEXTRACTO: ${a.contentSnippet}`
    )
    .join('\n\n---\n\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Eres el editor de noticias de Fortantis, una firma especializada en arbitraje internacional. Tu tarea es seleccionar y resumir las noticias más relevantes del siguiente listado.

CRITERIOS DE SELECCIÓN:
- Prioriza: nuevos casos ICSID, decisiones ICC/UNCITRAL, laudos relevantes, cambios regulatorios, nombramientos de árbitros importantes, tendencias en inversión extranjera y disputas estado-inversionista
- Elimina: noticias genéricas de litigación doméstica, artículos de baja relevancia, duplicados
- Selecciona entre 6 y 10 artículos máximo

PARA CADA ARTÍCULO SELECCIONADO, devuelve un objeto JSON con:
- "title": título en español (reescrito si es necesario, máx 100 caracteres)
- "summary": resumen ejecutivo en español de 2-3 oraciones (máx 250 caracteres), claro y preciso para profesionales del derecho
- "source": nombre de la fuente original
- "sourceUrl": URL original del artículo
- "publishedAt": fecha en formato ISO 8601 (YYYY-MM-DD)
- "category": una de estas categorías: "Inversión Internacional" | "Arbitraje Comercial" | "Doctrina y Análisis" | "Institucional" | "Regulación"

Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown.

ARTÍCULOS:
${articlesText}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  let parsed: Omit<CuratedArticle, 'id'>[]
  try {
    parsed = JSON.parse(text)
  } catch {
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('Claude no devolvió JSON válido')
    parsed = JSON.parse(match[0])
  }

  return parsed.map((a) => ({ ...a, id: randomUUID() }))
}
