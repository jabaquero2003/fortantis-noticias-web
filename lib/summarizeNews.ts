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
  region: string
  whyItMatters: string
}

export interface BoutiquePublication {
  id: string
  title: string
  firm: string
  author?: string
  date: string
  sourceType: string
  jurisdiction?: string
  summary: string
  link: string
}

export interface ArbitrationEvent {
  id: string
  name: string
  organizer: string
  date: string
  location: string
  region: string
  link: string
}

export interface BriefResult {
  briefText: string
  morningBrief: string
  articles: CuratedArticle[]
  boutiques: BoutiquePublication[]
  events: ArbitrationEvent[]
}

const SYSTEM_CONTEXT = `Eres el motor editorial del "Noticiero Fortantis", brief interno de inteligencia arbitral para Fortantis, boutique especializada en arbitraje internacional, disputas complejas, cuantificación de daños, valuación y estrategia en controversias.

AUDIENCIA: Socios, directores legales y expertos en daños de Fortantis. Conocen el campo a nivel experto. Necesitan inteligencia accionable, no resúmenes básicos.

PRIORIDAD GEOGRÁFICA OBLIGATORIA — en este orden estricto:
1. México — máxima prioridad absoluta
2. América Latina — alta prioridad
3. España — alta prioridad
4. Global — solo si es genuinamente importante, precedente clave, o directamente conectado con las áreas de práctica de Fortantis

Historias sobre disputas Rusia/Europa, Iran/Bahrain u otros casos globales sin conexión con México, LatAm o España NO deben liderar el noticiero, salvo que sean históricamente excepcionales o relevantes para la práctica de Fortantis.

TONO Y ESTILO OBLIGATORIO:
- Narrativo y riguroso. Cada noticia cuenta una historia con contexto, tensión y señal accionable.
- El lector debe entender qué pasó, quién es el actor, en qué foro, contra quién, con qué resultado y qué sigue.
- Lenguaje técnico del campo: laudo, quantum, lucro cesante, DCF, BIT, ICSID, ISDS, denegación de beneficios, medida cautelar, enforcement, anulación, costas. Usar como experto, no explicar.
- Lenguaje prudente para juicios propios: "puede ser relevante porque…", "conviene monitorear…", "la señal principal es…"
- PROHIBIDO: "en un mundo globalizado", "cada vez más importante", "es fundamental destacar", "sin lugar a dudas", "en el contexto actual", "cabe mencionar que", "resulta evidente".
- TODO en español. Sin emojis, signos de admiración ni lenguaje promocional.
- NO copies párrafos de los artículos. Parafrasea, interpreta y da contexto propio.
- NO des asesoría legal.

FILTRO EDITORIAL INTERNO — incluir solo si tiene valor claro para Fortantis:

SEÑALES FUERTES DE INCLUSIÓN:
- Conexión con México, LatAm o España
- Arbitraje de inversión / ICSID / ISDS
- Enforcement o anulación de laudos arbitrales
- Arbitraje comercial internacional en sectores estratégicos
- Sectores relevantes: energía, infraestructura, minería, construcción, petróleo y gas, telecomunicaciones, concesiones, M&A, joint ventures, disputas entre accionistas
- Publicación sustantiva de boutique de arbitraje, gran práctica de arbitraje internacional, o firma de expertos/quantum
- Desarrollo legal relevante, resultado de caso, decisión jurisdiccional, riesgo regulatorio real, tendencia de mercado con implicaciones para disputas

SEÑALES DE EXCLUSIÓN:
- Noticias legales genéricas sin ángulo arbitral
- Litigio doméstico sin conexión con arbitraje internacional
- Rankings, directorios y reconocimientos generales
- Contenido superficial sin sustancia técnica
- Historias globales sin conexión con México, LatAm, España o áreas de práctica de Fortantis
- Duplicados de ediciones anteriores

Si no hay suficientes historias fuertes, publicar menos noticias de alta calidad en lugar de llenar con contenido mediocre. Calidad sobre volumen.

CRITERIOS DE SELECCIÓN — ORDEN DE PRIORIDAD:
1. GEOGRAFÍA: México primero, luego LatAm, luego España, luego global relevante
2. RELEVANCIA TEMÁTICA: arbitraje de inversión / comercial internacional, sectores estratégicos, enforcement/anulación
3. RECENCIA: entre historias de similar relevancia, priorizar la más reciente

FIRMAS Y BOUTIQUES A MONITOREAR (sección ¿Qué dicen las Boutiques?):
Three Crowns, GBS/Galliard Banifatemi Shelbaya Disputes, Fietta, Volterra Fietta, Chaffetz Lindsey, Hanotiau & van den Berg, Lévy Kaufmann-Kohler, Lalive, Schellenberg Wittmer, Aceris Law, Castaldi Partners, White & Case, Freshfields, King & Spalding, Debevoise & Plimpton, Hogan Lovells, Latham & Watkins, Arnold & Porter, Curtis Mallet-Prevost, Dechert, Clifford Chance, A&O Shearman, Herbert Smith Freehills, Gibson Dunn, Sidley Austin, Skadden, WilmerHale, Foley Hoag, Quinn Emanuel, Dentons, Squire Patton Boggs, Bullard Falla Ezcurra+, Jana & Gil Dispute Resolution, Von Wobeser y Sierra, González de Cossío Abogados, Posse Herrera Ruiz, Marval O'Farrell Mairal, Mattos Filho, L.O. Baptista, HKA, FTI Consulting, Compass Lexecon, Secretariat, BRG, Charles River Associates, Accuracy, Kroll, Ankura, Versant Partners`

function buildPrompt(articlesText: string, dateStr: string, editionType: string): string {
  return `${SYSTEM_CONTEXT}

FECHA ACTUAL: ${dateStr}
TIPO DE EDICIÓN: ${editionType}

ARTÍCULOS DISPONIBLES:
${articlesText}

---

Genera el "Noticiero Fortantis" completo con la estructura exacta indicada. Escribe en prosa fluida. Sin sub-etiquetas internas. Integra toda la información en párrafos naturales.

# Noticiero Fortantis

Fecha de edición: ${dateStr}
Uso: Brief interno de inteligencia arbitral

## 1. Morning Brief

2-3 oraciones ejecutivas: señal dominante del día, geografía o sector que lidera, por qué vale la pena leer esta edición. Sin relleno. Directo.

## 2. Noticias Principales

Selecciona hasta 5 noticias aplicando la prioridad geográfica: México primero, luego LatAm, luego España, luego global solo si es genuinamente relevante. Si hay menos de 5 historias que pasen el filtro editorial, publicar solo las que sean fuertes.

Para cada noticia:

### Noticia [N]: [Título claro en español]

**Fuente:** [nombre] · **Fecha:** [fecha] · **País/Región:** [México | LatAm | España | Global] · **[Leer artículo →](URL)**

[Tres párrafos en prosa fluida, sin sub-títulos:
Párrafo 1 — El hecho: quién es el actor, qué ocurrió, en qué foro o jurisdicción, contra quién, con qué resultado. Cifras precisas.
Párrafo 2 — El contexto: dónde encaja en la práctica arbitral, precedentes relevantes, tensiones doctrinales o regulatorias.
Párrafo 3 — La señal: qué conviene monitorear, qué patrón refuerza o rompe, qué implica para quien asesora disputas complejas.]

## 3. ¿Qué dicen las Boutiques de Arbitraje?

Monitoreo de publicaciones, análisis, client alerts, actualizaciones legales, case notes e informes de boutiques de arbitraje, grandes prácticas de arbitraje internacional y firmas de expertos/quantum identificados en los artículos disponibles.

Para cada publicación identificada: firma, autor si está disponible, tipo de publicación (artículo, client alert, actualización legal, newsletter, case note, informe), resumen sustantivo de 2-4 oraciones con valor real para Fortantis, jurisdicción/región si aplica, y link.

Incluir solo publicaciones con sustancia técnica real. Excluir contrataciones, rankings, premios o contenido genérico de firma.

Si no hay publicaciones relevantes de firmas en los artículos disponibles, escribir exactamente:
"Sin publicaciones relevantes de firmas identificadas en esta edición."

## 4. Eventos de Arbitraje

Eventos arbitrales próximos identificados en los artículos disponibles. Prioridad: México, LatAm, USA, Global. Para cada uno: nombre, organizador, fecha, lugar o formato online, región, y por qué puede ser útil para Fortantis. Conciso.

Si no hay eventos identificados, escribir exactamente:
"Sin eventos de arbitraje identificados en esta edición."

## 5. Fuentes

Lista completa de todos los artículos revisados:
- [Título] — [Fuente] — [Fecha] — [Link]

---

Después del brief, agrega este bloque JSON sin modificar los delimitadores:

<<<JSON_START>>>
{
  "morningBrief": "texto de apertura, una sola línea sin saltos de línea, máximo 3 oraciones ejecutivas",
  "articles": [
    {
      "title": "título en español, máximo 90 caracteres",
      "summary": "resumen ejecutivo, máximo 2 oraciones, máximo 200 caracteres",
      "source": "nombre de la fuente",
      "sourceUrl": "URL exacta del artículo",
      "publishedAt": "YYYY-MM-DD",
      "category": "Inversión Internacional | Arbitraje Comercial | Doctrina y Análisis | Institucional | Regulación",
      "region": "México | LatAm | España | Global",
      "whyItMatters": "por qué importa para Fortantis, 1-2 oraciones directas"
    }
  ],
  "boutiques": [
    {
      "title": "título de la publicación",
      "firm": "nombre exacto de la firma o boutique",
      "author": "nombre del autor si está disponible, omitir si no se menciona",
      "date": "YYYY-MM-DD",
      "sourceType": "article | client alert | legal update | newsletter | case note | report | LinkedIn post",
      "jurisdiction": "jurisdicción o región si aplica, omitir si no aplica",
      "summary": "resumen sustantivo de 2-4 oraciones con valor real para Fortantis",
      "link": "URL exacta"
    }
  ],
  "events": [
    {
      "name": "nombre del evento",
      "organizer": "organizador",
      "date": "fecha o rango de fechas",
      "location": "ciudad, país o 'Online'",
      "region": "México | LatAm | USA | Europa | Global",
      "link": "URL de registro o información"
    }
  ]
}
<<<JSON_END>>>

IMPORTANTE:
- "articles" contiene exactamente los artículos seleccionados para Noticias Principales, mismo orden, máximo 5.
- "boutiques" puede ser array vacío [] si no hay publicaciones de firmas relevantes en los artículos disponibles.
- "events" puede ser array vacío [] si no hay eventos identificados.`
}

export async function curateAndSummarize(raw: RawArticle[]): Promise<BriefResult> {
  if (raw.length === 0) {
    return {
      briefText: '',
      morningBrief: 'No se encontraron artículos para esta edición.',
      articles: [],
      boutiques: [],
      events: [],
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
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const editionType = dayNames[dayNum] ?? today.toLocaleDateString('es-ES', { weekday: 'long' })

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
  let boutiques: BoutiquePublication[] = []
  let events: ArbitrationEvent[] = []

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim())
      morningBrief = parsed.morningBrief ?? ''
      articles = (parsed.articles ?? []).map((a: Omit<CuratedArticle, 'id'>) => ({
        ...a,
        id: randomUUID(),
      }))
      boutiques = (parsed.boutiques ?? []).map((b: Omit<BoutiquePublication, 'id'>) => ({
        ...b,
        id: randomUUID(),
      }))
      events = (parsed.events ?? []).map((e: Omit<ArbitrationEvent, 'id'>) => ({
        ...e,
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

  articles = articles.slice(0, 5)

  return { briefText, morningBrief, articles, boutiques, events }
}
