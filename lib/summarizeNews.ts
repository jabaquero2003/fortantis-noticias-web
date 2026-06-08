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
  whyItMatters: string
}

export interface BriefResult {
  briefText: string
  morningBrief: string
  articles: CuratedArticle[]
}

const SYSTEM_CONTEXT = `Eres el motor editorial del "Noticiero Fortantis", un brief interno automatizado para Fortantis, una boutique enfocada en arbitraje internacional, disputas complejas, cuantificación de daños, valuación, análisis financiero y estrategia en controversias.

Tu tarea es transformar una lista de artículos en un brief interno claro, útil y estratégico para el equipo de Fortantis.

IMPORTANTE — TONO Y ATRIBUCIÓN:
Este contenido es automatizado y asistido por IA. No escribas como si Fortantis estuviera emitiendo una opinión oficial.
Evita: "Fortantis considera", "Fortantis opina", "nuestra postura", "creemos que".
Usa: "Este tema puede ser relevante porque…", "Conviene monitorear…", "Puede ser útil para investigación interna…", "La señal principal es…"

REGLAS:
1. No inventes información. Solo usa lo que está en los artículos.
2. No des asesoría legal.
3. No copies párrafos largos de los artículos.
4. Selecciona solo los más relevantes — no todos.
5. Tono profesional, ejecutivo y sobrio.
6. Todo en español.
7. Legible en 5-7 minutos.
8. No exageres la importancia de una noticia sin sustento.
9. No uses lenguaje promocional.
10. No uses emojis, signos de admiración ni frases vacías.
11. NO uses sub-títulos dentro de cada noticia. Escribe en prosa fluida, sin etiquetas como "Qué pasó:", "Por qué importa:", "Ángulo a monitorear:". Integra toda la información en párrafos naturales.
12. Incluye fuente, fecha y link en cada señal.

CRITERIOS DE SELECCIÓN (prioriza artículos que cumplan uno o más):
- Arbitraje internacional (comercial o inversión)
- Disputas inversionista-Estado
- México, América Latina o mercados emergentes
- Sectores: energía, infraestructura, minería, construcción, petróleo y gas, telecomunicaciones, contratos públicos
- Daños, quantum, valuación, lucro cesante, expropiación, DCF, intereses, terminación contractual
- Enforcement, anulación, jurisdicción, laudos, cortes nacionales relacionadas con arbitraje
- Instituciones arbitrales (ICSID, ICC, UNCITRAL, LCIA, SIAC, etc.)
- Firmas legales, boutiques, expertos, medios especializados`

function buildPrompt(articlesText: string, dateStr: string, editionType: string): string {
  return `${SYSTEM_CONTEXT}

FECHA ACTUAL: ${dateStr}
TIPO DE EDICIÓN: ${editionType}

ARTÍCULOS DISPONIBLES:
${articlesText}

---

Genera el "Noticiero Fortantis" completo con la siguiente estructura. IMPORTANTE: no uses sub-títulos dentro de las secciones — escribe todo en prosa fluida y párrafos naturales.

# Noticiero Fortantis

Fecha de edición: ${dateStr}
Uso: Brief interno automatizado

## 1. Apertura

Escribe 3-5 líneas que resuman la edición. ¿Cuál es la señal principal? ¿Qué temas dominan? ¿Por qué es útil revisar esta edición? Sin frases genéricas. Ejecutivo y directo. Sin sub-títulos.

## 2. Señales Principales

Selecciona las 6 noticias más relevantes. Para cada una, usa este formato:

### [Título corto y claro — sin numeración]

**Fuente:** [nombre] · **Fecha:** [fecha] · **[Leer artículo](URL)**

[Uno o dos párrafos en prosa fluida que expliquen: qué pasó, por qué importa para arbitraje o disputas complejas, y qué conviene monitorear. Sin sub-títulos. Sin etiquetas. Texto directo y ejecutivo.]

## 3. LatAm Radar

REGLA CRÍTICA: NO repitas artículos que ya aparecen en Señales Principales. Si una noticia ya está en la sección anterior, no la incluyas aquí. Esta sección es exclusivamente para señales o tendencias regionales distintas, o para explicar el ángulo latinoamericano de un tema que no fue cubierto arriba.

Máximo 3 puntos. Si no hay señales LatAm genuinamente distintas, escribe: "No se identificaron señales regionales adicionales en esta edición."

Para cada punto:

### [País / Región / Sector]

[Párrafo en prosa fluida sobre la señal regional y su relevancia para LatAm. Sin sub-títulos.]

## 4. Quantum & Daños

Solo si hay ángulo económico claro (daños, valuación, DCF, expropiación, lucro cesante, terminación contractual). Si no aplica, escribe: "Sin señales de quantum o daños en esta edición."

Si aplica, un párrafo fluido por tema identificado. Sin sub-títulos internos.

## 5. Firmas e Instituciones

Máximo 3 puntos sobre qué están publicando o posicionando firmas, boutiques o instituciones. Sin sub-títulos internos. Prosa fluida.

Si no aplica: "Sin publicaciones relevantes de firmas o instituciones en esta edición."

## 6. Oportunidad de Contenido

Solo si el tema cumple al menos 4 criterios: reciente, relevante, información suficiente, ángulo claro, diferenciador para Fortantis. Un párrafo fluido con la recomendación y su razonamiento.

Si no hay: "Sin oportunidades de contenido identificadas en esta edición."

## 7. Fuentes

Lista limpia:
- [Título] — [Fuente] — [Fecha] — [Link]

---

Después del brief, agrega este bloque JSON para uso del sistema:

<<<JSON_START>>>
{
  "morningBrief": "texto de apertura (3-5 líneas, sin saltos de línea)",
  "articles": [
    {
      "title": "título en español (máx 100 caracteres)",
      "summary": "resumen ejecutivo en prosa, 2-3 oraciones (máx 250 caracteres)",
      "source": "nombre de la fuente",
      "sourceUrl": "URL del artículo",
      "publishedAt": "YYYY-MM-DD",
      "category": "Inversión Internacional | Arbitraje Comercial | Doctrina y Análisis | Institucional | Regulación",
      "whyItMatters": "por qué importa, en prosa fluida, 1-2 oraciones"
    }
  ]
}
<<<JSON_END>>>`
}

export async function curateAndSummarize(raw: RawArticle[]): Promise<BriefResult> {
  if (raw.length === 0) {
    return {
      briefText: '',
      morningBrief: 'No se encontraron artículos para esta edición.',
      articles: [],
    }
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const dayNum = today.getDay()
  const editionType =
    dayNum === 2 ? 'Martes' : dayNum === 5 ? 'Viernes' : today.toLocaleDateString('es-ES', { weekday: 'long' })

  const articlesText = raw
    .map(
      (a, i) =>
        `[${i + 1}] TÍTULO: ${a.title}\nFUENTE: ${a.source}\nFECHA: ${a.pubDate}\nURL: ${a.link}\nEXTRACTO: ${a.contentSnippet}`
    )
    .join('\n\n---\n\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: buildPrompt(articlesText, dateStr, editionType),
      },
    ],
  })

  const fullText = response.content[0].type === 'text' ? response.content[0].text : ''

  const jsonMatch = fullText.match(/<<<JSON_START>>>([\s\S]*?)<<<JSON_END>>>/)
  const briefText = fullText.replace(/<<<JSON_START>>>[\s\S]*?<<<JSON_END>>>/, '').trim()

  let morningBrief = ''
  let articles: CuratedArticle[] = []

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim())
      morningBrief = parsed.morningBrief ?? ''
      articles = (parsed.articles ?? []).map((a: Omit<CuratedArticle, 'id'>) => ({
        ...a,
        id: randomUUID(),
      }))
    } catch {
      const arrayMatch = jsonMatch[1].match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        try {
          articles = JSON.parse(arrayMatch[0]).map((a: Omit<CuratedArticle, 'id'>) => ({
            ...a,
            id: randomUUID(),
          }))
        } catch {}
      }
    }
  }

  return { briefText, morningBrief, articles }
}
