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

  console.log('Obteniendo noticias de fuentes RSS...')
  const rawArticles = await fetchAllNews()
  console.log(`   Total obtenido: ${rawArticles.length} artículos\n`)

  if (rawArticles.length === 0) {
    console.log('No se encontraron artículos nuevos. Abortando.')
    process.exit(0)
  }

  console.log('Curación y resumen con Claude AI...')
  const brief = await curateAndSummarize(rawArticles)
  console.log(`   Artículos seleccionados: ${brief.articles.length}`)
  console.log(`   Brief generado: ${brief.briefText.length} caracteres\n`)

  const updated = {
    lastUpdated: new Date().toISOString(),
    edition: nextEdition,
    morningBrief: brief.morningBrief,
    briefText: brief.briefText,
    articles: brief.articles,
  }

  writeFileSync(dataPath, JSON.stringify(updated, null, 2), 'utf-8')
  console.log(`Edición #${nextEdition} guardada en data/news.json`)

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
