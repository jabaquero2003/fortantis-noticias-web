import { fetchAllNews } from '../lib/fetchNews'
import { curateAndSummarize } from '../lib/summarizeNews'
import { sendNewsEmail } from '../lib/sendEmail'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

async function main() {
  console.log('\n Fortantis — Actualización de noticias de arbitraje\n')

  const dataPath = join(process.cwd(), 'data', 'news.json')
  const current = JSON.parse(readFileSync(dataPath, 'utf-8'))
  const nextEdition = (current.edition ?? 0) + 1

  // URLs ya publicadas en ediciones anteriores (evitar repetición)
  const previousUrls: string[] = current.publishedUrls ?? []

  console.log('Obteniendo noticias de fuentes RSS...')
  const allRaw = await fetchAllNews()
  console.log(`   Total obtenido: ${allRaw.length} artículos`)

  // Filtrar artículos ya publicados en ediciones previas
  const freshRaw = allRaw.filter((a) => !previousUrls.includes(a.link))
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

  // Acumular URLs publicadas (máx. 200 para evitar crecer indefinidamente)
  const newPublishedUrls = [
    ...brief.articles.map((a) => a.sourceUrl),
    ...previousUrls,
  ].slice(0, 200)

  const updated = {
    lastUpdated: new Date().toISOString(),
    edition: nextEdition,
    morningBrief: brief.morningBrief,
    briefText: brief.briefText,
    articles: brief.articles,
    publishedUrls: newPublishedUrls,
  }

  writeFileSync(dataPath, JSON.stringify(updated, null, 2), 'utf-8')
  console.log(`Edición #${nextEdition} guardada — ${newPublishedUrls.length} URLs en historial`)

  console.log('\nEnviando correo al equipo Fortantis...')
  try {
    await sendNewsEmail(brief, nextEdition)
  } catch (emailErr) {
    console.warn('Correo no enviado (dominio no verificado en Resend):', (emailErr as Error).message)
    console.warn('   La pagina web se actualizara de todas formas.')
  }

  console.log('\nProceso completado\n')
}

main().catch((err) => {
  console.error('Error fatal:', err)
  process.exit(1)
})
