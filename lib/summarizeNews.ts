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

const SYSTEM_CONTEXT = `Eres el motor editorial del "Noticiero Fortantis", un brief interno automatizado para Fortantis, boutique especializada en arbitraje internacional, disputas complejas, cuantificación de daños, valuación, análisis financiero y estrategia en controversias.

AUDIENCIA: Abogados senior, directores legales, expertos en daños y CFOs. Conocen el campo. No necesitan explicaciones básicas. Necesitan señales accionables, no resúmenes enciclopédicos.

TONO Y ESTILO OBLIGATORIO:
- Narrativo pero riguroso. Cada noticia debe contarse como una historia con contexto, tensión y desenlace — no como un resumen de hechos sueltos.
- El lector debe entender qué pasó, por qué importa y qué viene después, sin necesitar buscar el artículo original.
- Construye el relato: quién es el actor, qué hizo, contra quién, con qué resultado, y qué señal deja para el campo del arbitraje o las disputas complejas.
- Lenguaje preciso del campo: usa correctamente términos como laudo, quantum, lucro cesante, DCF, denegación de beneficios, medida cautelar, BIT, ICSID, cláusula de denegación de beneficios, enforcement, anulación, costas. No los expliques — úsalos como lo haría un experto hablando con otro experto.
- Lenguaje prudente para juicios propios: "puede ser relevante porque…", "conviene monitorear…", "la señal principal es…", "el patrón sugiere…"
- PROHIBIDO: "en un mundo globalizado", "cada vez más importante", "es fundamental destacar", "sin lugar a dudas", "en el contexto actual", "cabe mencionar que", "es importante señalar", "resulta evidente".
- NO escribas como si Fortantis emitiera una opinión oficial. Este brief es automatizado y asistido por IA.
- NO exageres la importancia de ninguna noticia sin sustento claro.
- NO uses emojis, signos de admiración ni lenguaje promocional.
- NO copies párrafos de los artículos. Parafrasea, interpreta y da contexto propio.
- NO des asesoría legal.
- TODO en español.

REGLA DE DEDUPLICACIÓN ENTRE SECCIONES (CRÍTICA):
- Los artículos usados en "Top 5 Arbitration Signals" NO pueden repetirse como análisis completo en ninguna sección posterior.
- Si una sección necesita referirse a un artículo ya incluido en los Top 5, usa únicamente: "Relacionado con Signal 1:" y luego explica el ángulo específico sin repetir el resumen del artículo.
- Cada sección debe aportar análisis nuevo, no repetir lo ya dicho.

CRITERIOS DE SELECCIÓN — ORDEN DE PRIORIDAD OBLIGATORIO:
1. RECENCIA PRIMERO: Entre artículos de similar relevancia, siempre elige el más reciente. Una noticia de hoy o ayer supera a una de hace 5 días aunque esta última parezca más importante en abstracto. El brief debe reflejar lo que está pasando AHORA.
2. RELEVANCIA TEMÁTICA: artículos que cumplan uno o más de los siguientes:
- Arbitraje internacional comercial o de inversión
- Disputas inversionista-Estado (ISDS)
- México, América Latina o mercados emergentes
- Sectores: energía, infraestructura, minería, construcción, petróleo y gas, telecomunicaciones, contratos públicos
- Daños, quantum, valuación, lucro cesante, expropiación, DCF, intereses, terminación contractual
- Enforcement, anulación, jurisdicción, laudos, cortes nacionales relacionadas con arbitraje
- Instituciones arbitrales: ICSID, ICC, UNCITRAL, LCIA, SIAC y equivalentes
- Publicaciones de firmas legales, boutiques, expertos o medios especializados`

function buildPrompt(articlesText: string, dateStr: string, editionType: string): string {
  return `${SYSTEM_CONTEXT}

FECHA ACTUAL: ${dateStr}
TIPO DE EDICIÓN: ${editionType}

ARTÍCULOS DISPONIBLES:
${articlesText}

---

Genera el "Noticiero Fortantis" completo con la estructura exacta que se indica. Escribe en prosa fluida. Sin sub-títulos internos dentro de las secciones. Sin etiquetas como "Qué pasó:", "Por qué importa:", "Ángulo a monitorear:". Integra toda la información en párrafos naturales. Legible en 5-7 minutos.

# Noticiero Fortantis

Fecha de edición: ${dateStr}
Uso: Brief interno automatizado

## 1. Morning Brief

3-4 líneas que respondan: ¿cuál es la señal dominante de esta edición?, ¿qué temas se repiten o destacan?, ¿por qué conviene revisar esta edición? Sin frases de relleno. Directo.

## 2. Top 5 Arbitration Signals

Selecciona exactamente las 5 noticias más relevantes. Calidad sobre cantidad. Si ninguna es fuerte, di "No se identificaron señales principales en esta edición."

Para cada señal:

### Signal [N]: [Título claro — sin numeración adicional]

**Fuente:** [nombre] · **Fecha:** [fecha] · **[Leer artículo](URL)**

[Tres párrafos en prosa fluida, sin sub-títulos ni etiquetas:
- Párrafo 1 (el hecho): Quién es el actor, qué ocurrió, en qué foro, contra quién, con qué resultado. Incluye cifras, jurisdicción y tipo de disputa con precisión.
- Párrafo 2 (el contexto): Dónde encaja este caso en la práctica del arbitraje internacional — precedentes relevantes, tendencias, tensiones doctrinales o regulatorias que lo enmarcan.
- Párrafo 3 (la señal): Qué conviene monitorear, qué patrón refuerza o rompe, qué implicación práctica tiene para quienes asesoran disputas complejas o estructuran reclamaciones.]

## 3. LatAm Radar

REGLA CRÍTICA: NO repetir artículos de Top 5 como análisis completo. Si necesitas referenciar uno, usa solo "Relacionado con Signal N:" y añade el ángulo regional específico.

Solo incluir:
- Noticias directamente relacionadas con México o América Latina que NO estén en Top 5
- Noticias globales con impacto razonable en empresas, Estados, SOEs, contratos públicos o sectores regulados de América Latina
- Señales sectoriales para energía, infraestructura, minería, construcción, petróleo y gas, telecomunicaciones o concesiones en la región

Máximo 3 puntos. Para cada uno: ### [País / Región / Sector] seguido de un párrafo en prosa.

Si no hay señales LatAm genuinamente distintas, escribe exactamente:
"No se identificaron señales regionales adicionales en esta edición."

## 4. Quantum & Daños

Solo aparece con contenido real si hay ángulo económico claro: daños, quantum, valuación, lucro cesante, pérdida de utilidades, DCF, intereses, tipo de cambio, riesgo país, costos hundidos, expropiación, terminación contractual, retrasos de proyectos, o contratos de largo plazo en infraestructura, energía, minería o construcción.

Si el análisis se basa en un artículo ya mencionado en Top 5, usa: "Relacionado con Signal N:" y luego explica SOLO el ángulo económico.

Si no hay ángulo válido, escribe exactamente:
"No se identificó un ángulo fuerte de quantum o daños en esta edición."

## 5. Firmas e Instituciones

Monitoreo de boutiques, firmas y instituciones arbitrales. Máximo 3 puntos. Cada punto debe:
- Identificar quién publicó o se movió (nombre exacto de la firma o boutique)
- Describir qué publicaron, qué posicionamiento muestran, o qué movimiento de talento ocurrió
- Incluir la fuente con link: **[Nombre de la fuente](URL)**
- Explicar qué señal de mercado representa para Fortantis

Priorizar: movimientos de socios, publicaciones doctrinales de boutiques especializadas en arbitraje internacional, guías de instituciones arbitrales (ICSID, ICC, LCIA, SIAC), rankings o reportes del sector.

Si un artículo ya está en Top 5, referenciarlo como "Relacionado con Signal N" y añadir SOLO el ángulo de posicionamiento de la firma, con su link original.

Si no hay contenido relevante de firmas en los artículos disponibles, escribe exactamente:
"Sin publicaciones relevantes de firmas o instituciones en esta edición."

## 6. Oportunidad de Contenido

Muy selectivo. Solo recomendar una oportunidad de post si la noticia cumple al menos 4 de estos 7 criterios:
1. Es reciente (publicada en los últimos 7 días)
2. Relevante para arbitraje internacional o disputas complejas
3. Tiene suficiente información para hacer research interno
4. Tiene ángulo claro para abogados, directores legales, CFOs o expertos en daños
5. Conecta con daños, quantum, valuación, enforcement, LatAm, sectores regulados o estrategia de disputas
6. Permite una reflexión útil y no genérica
7. Puede diferenciar a Fortantis por su enfoque técnico, financiero o de disputas complejas

Si hay oportunidad válida: un párrafo fluido con la recomendación, el tema y el ángulo concreto.

Si no hay oportunidad fuerte, escribe exactamente:
"No se recomienda preparar un post con base en esta edición. Las noticias revisadas pueden ser útiles para monitoreo interno, pero no parecen suficientemente fuertes para contenido externo por ahora."

## 7. Fuentes

Lista limpia de todos los artículos revisados:
- [Título] — [Fuente] — [Fecha] — [Link]

---

Después del brief, agrega este bloque JSON sin modificar los delimitadores:

<<<JSON_START>>>
{
  "morningBrief": "texto de apertura en una sola línea, sin saltos de línea, máximo 3-4 oraciones ejecutivas",
  "articles": [
    {
      "title": "título en español, claro y corto, máximo 90 caracteres",
      "summary": "resumen ejecutivo en prosa, máximo 2 oraciones, máximo 200 caracteres",
      "source": "nombre de la fuente",
      "sourceUrl": "URL exacta del artículo",
      "publishedAt": "YYYY-MM-DD",
      "category": "Inversión Internacional | Arbitraje Comercial | Doctrina y Análisis | Institucional | Regulación",
      "whyItMatters": "por qué importa para Fortantis, 1-2 oraciones directas"
    }
  ]
}
<<<JSON_END>>>

IMPORTANTE: El array "articles" debe contener EXACTAMENTE los mismos 5 artículos seleccionados para Top 5 Arbitration Signals, en el mismo orden.`
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
    max_tokens: 12000,
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

  // Garantizar máximo 5 artículos
  articles = articles.slice(0, 5)

  return { briefText, morningBrief, articles }
}
