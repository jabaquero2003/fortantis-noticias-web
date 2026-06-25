import { readFileSync } from 'fs'
import { join } from 'path'
import { sendNewsEmail } from '../lib/sendEmail'
import { BriefResult } from '../lib/summarizeNews'

async function main() {
  const dataPath = join(process.cwd(), 'data', 'news.json')
  const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

  const brief: BriefResult = {
    briefText: data.briefText ?? '',
    morningBrief: data.morningBrief ?? '',
    articles: data.articles ?? [],
    boutiques: data.boutiques ?? [],
    events: data.events ?? [],
  }

  console.log(`\nEnviando correo — Edición #${data.edition}`)
  await sendNewsEmail(brief, data.edition)
  console.log('Correo enviado correctamente\n')
}

main().catch((err) => {
  console.error('Error enviando correo:', err.message)
  process.exit(1)
})
