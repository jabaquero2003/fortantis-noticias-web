import { fetchAllNews } from '../lib/fetchNews'
import { curateAndSummarize } from '../lib/summarizeNews'
import { sendNewsEmail } from '../lib/sendEmail'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Normaliza URLs para comparar: quita parámetros UTM, trailing slash, lowercase
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    // Eliminar parámetros de tracking comunes
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source']
    trackingParams.forEach((p) => u.searchParams.delete(p))
    return (u.origin + u.pathname).toLowerCase().replace(/\/$/, '')
  } catch {
    return url.toLowerCase().replace(/\/$/, '')
  }
}

// Normaliza títulos para comparar: lowercase, quita signos, colapsa espacios
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

interface HistoryEntry {
  normalizedUrl: string
  normalizedTitle: string
  dateUsed: string
  editionId: number
}

async function main() {
  console.log('\n Fortantis — Actualización de noticias de arbitraje\n')

  const dataPath = join(process.cwd(), 'data', 'news.json')
  const current = JSON.parse(readFileSync(dataPath, 'utf-8'))
  const nextEdition = (current.edition ?? 0) + 1

  // Historial de deduplicación (URLs y títulos normalizados de ediciones anteriores)
  const history: HistoryEntry[] = current.history ?? []
  const usedNormalizedUrls = new Set(history.map((h) => h.normalizedUrl))
  const usedNormalizedTitles = new Set(history.map((h) => h.normalizedTitle))

  // Retrocompatibilidad: si hay publishedUrls pero no history, migrar
  if (history.length === 0 && current.publishedUrls?.length > 0) {
    for (const url of current.publishedUrls as string[]) {
      usedNormalizedUrls.add(normalizeUrl(url))
    }
    console.log(`   Migradas ${current.publishedUrls.length} URLs del historial anterior`)
  }

  console.log('Obteniendo noticias de fuentes RSS...')
  const allRaw = await fetchAllNews()
  console.log(`   Total obtenido: ${allRaw.length} artículos`)

  // Filtrar artículos ya publicados — por URL normalizada primero, luego por título
  const freshRaw = allRaw.filter((a) => {
    const normUrl = normalizeUrl(a.link)
    const normTitle = normalizeTitle(a.title)
    if (usedNormalizedUrls.has(normUrl)) return false
    if (usedNormalizedTitles.has(normTitle)) return false
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

  console.log('Curación y resumen con Claude AI...')
  const brief = await curateAndSummarize(freshRaw)
  console.log(`   Artículos seleccionados: ${brief.articles.length}`)
  console.log(`   Brief generado: ${brief.briefText.length} caracteres\n`)

  const today = new Date().toISOString()

  // Agregar artículos seleccionados al historial de deduplicación
  const newEntries: HistoryEntry[] = brief.articles.map((a) => ({
    normalizedUrl: normalizeUrl(a.sourceUrl),
    normalizedTitle: normalizeTitle(a.title),
    dateUsed: today,
    editionId: nextEdition,
  }))

  // Mantener historial: nuevas entradas primero, máximo 400 entradas (≈ 2 años de ediciones)
  const updatedHistory = [...newEntries, ...history].slice(0, 400)

  const updated = {
    lastUpdated: today,
    edition: nextEdition,
    morningBrief: brief.morningBrief,
    briefText: brief.briefText,
    articles: brief.articles,
    history: updatedHistory,
  }

  writeFileSync(dataPath, JSON.stringify(updated, null, 2), 'utf-8')
  console.log(`Edición #${nextEdition} guardada — ${updatedHistory.length} entradas en historial de deduplicación`)

  console.log('\nEnviando correo al equipo Fortantis...')
  try {
    await sendNewsEmail(brief, nextEdition)
  } catch (emailErr) {
    console.warn('Correo no enviado:', (emailErr as Error).message)
    console.warn('   La página web se actualizará de todas formas.')
  }

  console.log('\nProceso completado\n')
}

main().catch((err) => {
  console.error('Error fatal:', err)
  process.exit(1)
})
