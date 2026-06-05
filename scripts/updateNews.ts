import { fetchAllNews } from '../lib/fetchNews'
import { curateAndSummarize } from '../lib/summarizeNews'
import { sendNewsEmail } from '../lib/sendEmail'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

async function main() {
  console.log('\n🔍 Fortantis — Actualización de noticias de arbitraje\n')

  const dataPath = join(process.cwd(), 'data', 'news.json')
  const current = JSON.parse(readFileSync(dataPath, 'utf-8'))
  const nextEdition = (current.edition ?? 0) + 1

  console.log('📡 Obteniendo noticias de fuentes RSS...')
  const rawArticles = await fetchAllNews()
  console.log(`   Total obtenido: ${rawArticles.length} artículos\n`)

  if (rawArticles.length === 0) {
    console.log('⚠️  No se encontraron artículos nuevos. Abortando.')
    process.exit(0)
  }

  console.log('🤖 Curación y resumen con Claude AI...')
  const curated = await curateAndSummarize(rawArticles)
  console.log(`   Artículos seleccionados: ${curated.length}\n`)

  const updated = {
    lastUpdated: new Date().toISOString(),
    edition: nextEdition,
    articles: curated,
  }

  writeFileSync(dataPath, JSON.stringify(updated, null, 2), 'utf-8')
  console.log(`✓ data/news.json actualizado — Edición #${nextEdition}`)

  console.log('\n📧 Enviando correo al equipo Fortantis...')
  await sendNewsEmail(curated, nextEdition)

  console.log('\n✅ Proceso completado exitosamente\n')
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
