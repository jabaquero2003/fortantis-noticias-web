import { fetchAllNews } from '../lib/fetchNews'
import { fetchAllFirmPages } from '../lib/fetchFirmPages'
import { fetchFirmSearchResults } from '../lib/fetchFirmSearch'
import { curateAndSummarize, curateAndSummarizeV2 } from '../lib/summarizeNews'
import { structureStories } from '../lib/structureStories'
import { loadCases, upsertCase, saveCases, ArbitrationCase } from '../lib/caseMemory'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source']
    trackingParams.forEach((p) => u.searchParams.delete(p))
    return (u.origin + u.pathname).toLowerCase().replace(/\/$/, '')
  } catch {
    return url.toLowerCase().replace(/\/$/, '')
  }
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

interface UsedArticle {
  title: string
  normalizedTitle: string
  url: string
  normalizedUrl: string
  source: string
  dateUsed: string
  editionId: number
}

async function main() {
  console.log('\n Fortantis — Actualización de noticias de arbitraje\n')

  const dataPath = join(process.cwd(), 'data', 'news.json')
  const usedArticlesPath = join(process.cwd(), 'data', 'used-articles.json')

  const current = JSON.parse(readFileSync(dataPath, 'utf-8'))
  const nextEdition = (current.edition ?? 0) + 1

  // Cargar historial de artículos usados
  let usedArticles: UsedArticle[] = []
  if (existsSync(usedArticlesPath)) {
    try {
      usedArticles = JSON.parse(readFileSync(usedArticlesPath, 'utf-8'))
    } catch {
      usedArticles = []
    }
  }

  // Retrocompatibilidad: migrar history del news.json anterior si existe
  if (usedArticles.length === 0 && current.history?.length > 0) {
    usedArticles = (current.history as UsedArticle[]).map((h) => ({
      title: h.title ?? '',
      normalizedTitle: h.normalizedTitle ?? '',
      url: h.url ?? '',
      normalizedUrl: h.normalizedUrl ?? '',
      source: h.source ?? '',
      dateUsed: h.dateUsed ?? '',
      editionId: h.editionId ?? 0,
    }))
    console.log(`   Migradas ${usedArticles.length} entradas del historial anterior`)
  }

  // Retrocompatibilidad: migrar publishedUrls si no hay history ni used-articles
  if (usedArticles.length === 0 && current.publishedUrls?.length > 0) {
    usedArticles = (current.publishedUrls as string[]).map((url) => ({
      title: '', normalizedTitle: '', url, normalizedUrl: normalizeUrl(url),
      source: '', dateUsed: '', editionId: 0,
    }))
    console.log(`   Migradas ${usedArticles.length} URLs del historial legacy`)
  }

  const usedNormalizedUrls = new Set(usedArticles.map((a) => a.normalizedUrl).filter(Boolean))
  const usedNormalizedTitles = new Set(usedArticles.map((a) => a.normalizedTitle).filter(Boolean))

  // Cargar memoria histórica de casos
  let cases: ArbitrationCase[] = loadCases()
  console.log(`   Casos arbitrales conocidos: ${cases.length}`)

  console.log('Obteniendo noticias de fuentes RSS...')
  const rssRaw = await fetchAllNews()
  console.log(`   RSS total: ${rssRaw.length} artículos`)

  console.log('Obteniendo publicaciones de páginas de firmas...')
  const firmRaw = await fetchAllFirmPages()
  console.log(`   Firmas scraping: ${firmRaw.length} publicaciones`)

  console.log('Buscando publicaciones de firmas con Brave Search...')
  const searchRaw = await fetchFirmSearchResults()

  const allRaw = [...rssRaw, ...firmRaw, ...searchRaw]
  console.log(`   Total combinado: ${allRaw.length} artículos\n`)

  const freshRaw = allRaw.filter((a) => {
    if (usedNormalizedUrls.has(normalizeUrl(a.link))) return false
    if (usedNormalizedTitles.has(normalizeTitle(a.title))) return false
    return true
  })

  const filtered = allRaw.length - freshRaw.length
  if (filtered > 0) {
    console.log(`   Filtrados ${filtered} artículos ya publicados en ediciones anteriores`)
  }
  console.log(`   Artículos nuevos: ${freshRaw.length}\n`)

  if (freshRaw.length === 0) {
    console.log('No se encontraron artículos nuevos. Abortando.')
    process.exit(0)
  }

  // Etapa 1: estructurar artículos en historias con Claude Haiku
  console.log('Estructurando historias con Claude Haiku (Etapa 1)...')
  const structuredStories = await structureStories(freshRaw, cases)

  // Etapa 2: redacción editorial con Claude Sonnet
  console.log('Curación y redacción con Claude Sonnet (Etapa 2)...')
  const brief =
    structuredStories.length > 0
      ? await curateAndSummarizeV2(structuredStories)
      : await curateAndSummarize(freshRaw) // fallback si Haiku falla

  if (structuredStories.length > 0) {
    console.log(`   Historias estructuradas: ${structuredStories.length}`)
  } else {
    console.log('   Haiku falló — se usó flujo V1 como fallback')
  }
  console.log(`   Artículos seleccionados: ${brief.articles.length}`)
  console.log(`   Brief generado: ${brief.briefText.length} caracteres\n`)

  // Actualizar memoria de casos con todas las historias arbitrales identificadas
  if (structuredStories.length > 0) {
    const today8 = new Date().toISOString().slice(0, 10)
    for (const story of structuredStories) {
      if (!story.caseId || !story.isArbitrationCase) continue
      cases = upsertCase(
        cases,
        {
          caseId: story.caseId,
          officialNumber: story.caseNumber,
          name:
            story.parties?.claimant && story.parties?.respondent
              ? `${story.parties.claimant} v. ${story.parties.respondent}`
              : story.headline,
          claimant: story.parties?.claimant,
          respondent: story.parties?.respondent,
          country: story.country,
          forum: story.forum,
          sector: story.sector,
          currentStage: story.proceduralStage ?? 'Desconocido',
          development: {
            storyId: story.storyId,
            editionId: nextEdition,
            date: today8,
            stage: story.proceduralStage ?? 'Desconocido',
            summary: story.newDevelopment,
          },
        },
        nextEdition
      )
    }
    saveCases(cases)
    console.log(`Memoria de casos actualizada: ${cases.length} casos en total`)
  }

  const today = new Date().toISOString()

  // Registrar artículos y boutiques usados en esta edición
  const newEntries: UsedArticle[] = [
    ...brief.articles.map((a) => ({
      title: a.title,
      normalizedTitle: normalizeTitle(a.title),
      url: a.sourceUrl,
      normalizedUrl: normalizeUrl(a.sourceUrl),
      source: a.source,
      dateUsed: today,
      editionId: nextEdition,
    })),
    ...brief.boutiques.map((b) => ({
      title: b.title,
      normalizedTitle: normalizeTitle(b.title),
      url: b.link,
      normalizedUrl: normalizeUrl(b.link),
      source: b.firm,
      dateUsed: today,
      editionId: nextEdition,
    })),
  ]

  // Mantener máximo 400 entradas (≈ 2 años de ediciones)
  const updatedUsedArticles = [...newEntries, ...usedArticles].slice(0, 400)

  // Guardar used-articles.json
  writeFileSync(usedArticlesPath, JSON.stringify(updatedUsedArticles, null, 2), 'utf-8')
  console.log(`Historial de deduplicación: ${updatedUsedArticles.length} entradas en used-articles.json`)

  // Guardar news.json (sin history ni publishedUrls legacy)
  const updated = {
    lastUpdated: today,
    edition: nextEdition,
    morningBrief: brief.morningBrief,
    briefText: brief.briefText,
    articles: brief.articles,
    boutiques: brief.boutiques,
    events: brief.events,
  }

  writeFileSync(dataPath, JSON.stringify(updated, null, 2), 'utf-8')
  console.log(`Edición #${nextEdition} guardada en news.json`)

  console.log('\nProceso completado\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('Error fatal:', err)
  process.exit(1)
})
