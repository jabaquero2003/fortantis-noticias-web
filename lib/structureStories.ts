import Anthropic from '@anthropic-ai/sdk'
import { createHash } from 'crypto'
import { RawArticle } from './fetchNews'
import { ArbitrationCase } from './caseMemory'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ConsolidatedSource {
  articleId: string
  title: string
  url: string
  source: string
  pubDate: string
  contentSnippet: string
  isPaywalled: boolean
  sourceTier: 1 | 2 | 3 | 4
}

export interface StructuredStory {
  storyId: string
  caseId?: string
  headline: string
  geography: 'México' | 'LatAm' | 'España' | 'Global'
  country: string
  parties?: { claimant?: string; respondent?: string }
  forum?: string
  caseNumber?: string
  sector?: string
  proceduralStage?: string
  newDevelopment: string
  previousStage?: string
  isArbitrationCase: boolean
  isNewCase: boolean
  isCaseUpdate: boolean
  isBoutiqueAnalysis: boolean
  isEvent: boolean
  sources: ConsolidatedSource[]
  primarySource?: ConsolidatedSource
  firms?: string[]
  amounts?: string
}

interface HaikuStory {
  headline: string
  geography: string
  country: string
  parties?: { claimant?: string; respondent?: string }
  forum?: string
  caseNumber?: string
  sector?: string
  proceduralStage?: string
  newDevelopment: string
  isArbitrationCase: boolean
  isBoutiqueAnalysis: boolean
  isEvent: boolean
  firms?: string[]
  amounts?: string
  articleIndices: number[]
  primaryArticleIndex: number
  sourceTiers: number[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-|-$/g, '')
}

function generateCaseId(hs: HaikuStory): string | undefined {
  if (hs.caseNumber) return slugify(hs.caseNumber)
  if (hs.parties?.claimant && hs.parties?.respondent) {
    return slugify(`${hs.parties.claimant} v ${hs.parties.respondent}`)
  }
  return undefined
}

function generateStoryId(headline: string): string {
  return createHash('sha256').update(headline.toLowerCase().slice(0, 80)).digest('hex').slice(0, 16)
}

function buildArticleText(articles: RawArticle[]): string {
  return articles
    .map(
      (a, i) =>
        `[${i}] TÍTULO: ${a.title}\n    FUENTE: ${a.source} | CAT: ${a.category}\n    FECHA: ${a.pubDate.slice(0, 10)}\n    EXTRACTO: ${a.contentSnippet.slice(0, 280)}`
    )
    .join('\n\n')
}

const HAIKU_PROMPT = `Eres el motor de estructuración editorial del Noticiero Fortantis, un noticiero de arbitraje internacional.

TAREA: Analiza los artículos y agrúpalos en historias. Devuelve SOLO un array JSON válido, sin texto adicional, sin markdown.

REGLA DE AGRUPACIÓN — CRÍTICA:
Agrupa artículos en la MISMA historia SOLO SI comparten al menos UNO de:
1. Número de expediente exacto (ej: "ICSID/ARB/2026/12")
2. Nombres EXPLÍCITOS de AMBAS partes del caso presentes en ambos textos
3. Nombre específico del caso citado textualmente en ambos artículos
NUNCA agrupes solo por país, región, sector o tema general.

CLASIFICACIÓN (mutuamente exclusiva, en orden de prioridad):
- isArbitrationCase: true si hay un caso de arbitraje específico con partes o expediente identificables
- isBoutiqueAnalysis: true si es análisis/publicación doctrinal de firma sin caso específico, o si CATEGORÍA contiene "Boutique"
- isEvent: true si es conferencia, evento o concurso de arbitraje
- Si ninguna aplica: isArbitrationCase:false, isBoutiqueAnalysis:false, isEvent:false

JERARQUÍA sourceTiers (uno por cada índice en articleIndices, mismo orden):
1 = institución oficial (ICSID, PCA, ICC, tribunal, autoridad estatal, gobierno)
2 = medio especializado (GAR, Kluwer, JD Supra, Lexology)
3 = firma directamente involucrada en el caso
4 = firma externa analizando / agregador general

GEOGRAFÍA del tema principal: "México" | "LatAm" | "España" | "Global"

EXTRACCIÓN DE ENTIDADES — REGLA DE ORO:
Extrae SOLO lo que está EXPLÍCITAMENTE escrito en título o extracto del artículo.
Si no está escrito con claridad: OMITE el campo (usa null). No inferir. No inventar.
- parties: solo si los nombres completos de ambas partes están en el texto
- caseNumber: solo el número oficial exacto si aparece literalmente
- forum: solo si el nombre del tribunal/institución está en el texto

INCLUYE TODOS los artículos en al menos una historia. Los que no son relevantes para arbitraje van en su propia historia con todos los flags en false.

ESTRUCTURA JSON — devuelve un array de objetos con exactamente estos campos:
{
  "headline": "titular en español del desarrollo específico, máximo 90 caracteres",
  "geography": "México|LatAm|España|Global",
  "country": "país principal",
  "parties": {"claimant": "nombre si está en texto o null", "respondent": "nombre si está en texto o null"},
  "forum": "nombre del foro si está en texto, sino null",
  "caseNumber": "número oficial exacto si aparece en texto, sino null",
  "sector": "sector económico si está mencionado, sino null",
  "proceduralStage": "Registro|Constitución del tribunal|Audiencia|Laudo|Anulación|Enforcement|Otro, o null",
  "newDevelopment": "1 oración: qué pasó específicamente en este artículo",
  "isArbitrationCase": true|false,
  "isBoutiqueAnalysis": true|false,
  "isEvent": true|false,
  "firms": ["firmas legales mencionadas en el texto"],
  "amounts": "monto si está explícitamente en el texto, sino null",
  "articleIndices": [indices de artículos que pertenecen a esta historia],
  "primaryArticleIndex": indice del artículo más confiable/oficial de la historia,
  "sourceTiers": [tier por cada índice en articleIndices, mismo orden]
}`

export async function structureStories(
  articles: RawArticle[],
  cases: ArbitrationCase[]
): Promise<StructuredStory[]> {
  if (articles.length === 0) return []

  const articlesText = buildArticleText(articles)
  const fullPrompt = `${HAIKU_PROMPT}\n\nARTÍCULOS:\n${articlesText}\n\nJSON:`

  let rawJson = ''

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        messages: [{ role: 'user', content: fullPrompt }],
      })
      rawJson = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
      break
    } catch (err) {
      const apiErr = err as { error?: { type?: string } }
      if (attempt < 2 && apiErr?.error?.type === 'overloaded_error') {
        await new Promise((r) => setTimeout(r, 20000))
        continue
      }
      console.warn(`   Haiku structuring failed: ${String(err)}`)
      return []
    }
  }

  // Extract JSON array (Haiku sometimes wraps in markdown)
  const jsonMatch = rawJson.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    console.warn('   Haiku: no JSON array found in response')
    return []
  }

  let haikuStories: HaikuStory[]
  try {
    haikuStories = JSON.parse(jsonMatch[0]) as HaikuStory[]
  } catch (e) {
    console.warn('   Haiku: JSON parse failed:', e)
    return []
  }

  if (!Array.isArray(haikuStories) || haikuStories.length === 0) {
    console.warn('   Haiku: empty story list')
    return []
  }

  const structured: StructuredStory[] = []

  for (const hs of haikuStories) {
    if (!hs.headline || !Array.isArray(hs.articleIndices) || hs.articleIndices.length === 0) continue

    const caseId = hs.isArbitrationCase ? generateCaseId(hs) : undefined
    const storyId = generateStoryId(hs.headline)

    // Build consolidated sources sorted by tier (best first)
    const sources: ConsolidatedSource[] = hs.articleIndices
      .map((idx, i) => {
        const article = articles[idx]
        if (!article) return null
        return {
          articleId: createHash('sha256').update(article.link).digest('hex').slice(0, 16),
          title: article.title,
          url: article.link,
          source: article.source,
          pubDate: article.pubDate,
          contentSnippet: article.contentSnippet,
          isPaywalled: article.isPaywalled,
          sourceTier: (hs.sourceTiers?.[i] ?? 4) as 1 | 2 | 3 | 4,
        }
      })
      .filter((s): s is ConsolidatedSource => s !== null)

    sources.sort((a, b) => a.sourceTier - b.sourceTier)

    const primarySource =
      sources.find((s) => s.url === articles[hs.primaryArticleIndex]?.link) ?? sources[0]

    // Look up historical case context
    const existingCase = caseId
      ? cases.find(
          (c) =>
            c.caseId === caseId ||
            (hs.caseNumber && c.officialNumber === hs.caseNumber)
        )
      : undefined

    const isNewCase = hs.isArbitrationCase && !existingCase
    const isCaseUpdate =
      hs.isArbitrationCase &&
      !!existingCase &&
      !!hs.proceduralStage &&
      existingCase.currentStage !== hs.proceduralStage

    const validGeographies = ['México', 'LatAm', 'España', 'Global'] as const
    const geography = validGeographies.includes(hs.geography as typeof validGeographies[number])
      ? (hs.geography as 'México' | 'LatAm' | 'España' | 'Global')
      : 'Global'

    const partiesClean =
      hs.parties?.claimant || hs.parties?.respondent
        ? {
            claimant: hs.parties.claimant ?? undefined,
            respondent: hs.parties.respondent ?? undefined,
          }
        : undefined

    structured.push({
      storyId,
      caseId,
      headline: hs.headline,
      geography,
      country: hs.country ?? 'Global',
      parties: partiesClean,
      forum: hs.forum ?? undefined,
      caseNumber: hs.caseNumber ?? undefined,
      sector: hs.sector ?? undefined,
      proceduralStage: hs.proceduralStage ?? undefined,
      newDevelopment: hs.newDevelopment ?? '',
      previousStage: existingCase?.currentStage,
      isArbitrationCase: hs.isArbitrationCase ?? false,
      isNewCase,
      isCaseUpdate,
      isBoutiqueAnalysis: hs.isBoutiqueAnalysis ?? false,
      isEvent: hs.isEvent ?? false,
      sources,
      primarySource,
      firms: hs.firms?.length ? hs.firms : undefined,
      amounts: hs.amounts ?? undefined,
    })
  }

  return structured
}
