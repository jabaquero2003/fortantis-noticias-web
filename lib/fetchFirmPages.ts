import { RawArticle } from './fetchNews'

interface FirmPageSource {
  name: string
  url: string
  category: string
  country: string
}

const FIRM_PAGES: FirmPageSource[] = [
  // México — firmas
  { name: 'Von Wobeser y Sierra', url: 'https://vonwobeser.com/publicaciones/', category: 'Boutique México', country: 'México' },
  { name: 'González de Cossío Abogados', url: 'https://www.gdca.com.mx/publicaciones/', category: 'Boutique México', country: 'México' },
  { name: 'Galicia Abogados', url: 'https://www.galicia.mx/publicaciones/', category: 'Boutique México', country: 'México' },
  { name: 'Creel García-Cuéllar Aiza y Enríquez', url: 'https://www.creel.mx/publicaciones/', category: 'Boutique México', country: 'México' },
  { name: 'Basham Ringe y Correa', url: 'https://basham.com.mx/publicaciones/', category: 'Boutique México', country: 'México' },
  { name: 'Santamarina y Steta', url: 'https://www.s-s.mx/publicaciones/', category: 'Boutique México', country: 'México' },
  { name: 'Ritch Mueller', url: 'https://www.ritch.com.mx/publicaciones/', category: 'Boutique México', country: 'México' },
  { name: 'Greenberg Traurig México', url: 'https://www.gtlaw.com/en/insights?office=Mexico-City', category: 'Boutique México', country: 'México' },
  // México — instituciones
  { name: 'CAM México', url: 'https://www.arbitrajecam.com/noticias/', category: 'Institucional', country: 'México' },
  { name: 'ICC México', url: 'https://www.iccmex.mx/publicaciones/', category: 'Institucional', country: 'México' },
  // LatAm — firmas
  { name: 'Bullard Falla Ezcurra+', url: 'https://www.bullardabogados.pe/publicaciones/', category: 'Boutique LatAm', country: 'LatAm' },
  { name: 'Posse Herrera Ruiz', url: 'https://phrlegal.com/publicaciones/', category: 'Boutique LatAm', country: 'LatAm' },
  { name: "Marval O'Farrell Mairal", url: 'https://www.marval.com/publicaciones/', category: 'Boutique LatAm', country: 'LatAm' },
  { name: 'L.O. Baptista', url: 'https://www.lobbaptista.com.br/publicacoes/', category: 'Boutique LatAm', country: 'LatAm' },
  { name: 'Demarest', url: 'https://www.demarest.com.br/publicacoes/', category: 'Boutique LatAm', country: 'LatAm' },
  { name: 'Carey', url: 'https://www.carey.cl/publicaciones/', category: 'Boutique LatAm', country: 'LatAm' },
  { name: 'Philippi Prietocarrizosa Ferrero DU & Uría', url: 'https://www.ppulegal.com/publicaciones/', category: 'Boutique LatAm', country: 'LatAm' },
  { name: 'Miranda & Amado', url: 'https://www.miranda-amado.com/publicaciones/', category: 'Boutique LatAm', country: 'LatAm' },
  { name: 'Rodrigo Elías & Medrano', url: 'https://www.estudiorodrigo.com/publicaciones/', category: 'Boutique LatAm', country: 'LatAm' },
  { name: 'FERRERE', url: 'https://ferrere.com/publicaciones/', category: 'Boutique LatAm', country: 'LatAm' },
  { name: 'Pérez Bustamante & Ponce', url: 'https://www.pbplaw.com/publicaciones/', category: 'Boutique LatAm', country: 'LatAm' },
  { name: 'Bustamante Fabara', url: 'https://www.bustamante-fabara.com/publicaciones/', category: 'Boutique LatAm', country: 'LatAm' },
  // LatAm — instituciones
  { name: 'CAM Santiago', url: 'https://camsantiago.com/noticias/', category: 'Institucional', country: 'LatAm' },
  { name: 'CAC Bogotá', url: 'https://www.camarabogota.com/arbitraje/', category: 'Institucional', country: 'LatAm' },
  { name: 'CAMARB Brasil', url: 'https://camarb.com.br/noticias/', category: 'Institucional', country: 'LatAm' },
]

const FETCH_TIMEOUT_MS = 12000

function extractArticlesFromHtml(html: string, source: FirmPageSource): RawArticle[] {
  const articles: RawArticle[] = []
  const seen = new Set<string>()
  const baseHost = new URL(source.url).hostname

  // Extract all <a> tags with titles
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match

  while ((match = linkPattern.exec(html)) !== null) {
    const [, rawHref, rawContent] = match

    // Clean title from inner HTML
    const title = rawContent.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

    if (title.length < 25 || title.length > 250) continue

    // Skip navigation/generic links
    const lower = title.toLowerCase()
    if (
      lower.includes('inicio') || lower.includes('home') || lower.includes('contacto') ||
      lower.includes('nosotros') || lower.includes('quiénes') || lower.includes('servicios') ||
      lower.includes('equipo') || lower.includes('attorneys') || lower.includes('lawyers') ||
      lower.includes('ver más') || lower.includes('read more') || lower.includes('siguiente') ||
      lower.includes('anterior') || lower.includes('buscar') || lower.includes('search')
    ) continue

    // Build full URL
    let fullUrl: string
    try {
      fullUrl = rawHref.startsWith('http')
        ? rawHref
        : new URL(rawHref, source.url).toString()
    } catch {
      continue
    }

    // Only include links from same domain
    try {
      const linkHost = new URL(fullUrl).hostname
      if (!linkHost.includes(baseHost.replace('www.', ''))) continue
    } catch {
      continue
    }

    if (seen.has(fullUrl)) continue
    seen.add(fullUrl)

    articles.push({
      title,
      link: fullUrl,
      contentSnippet: '',
      pubDate: new Date().toISOString(),
      source: source.name,
      category: source.category,
    })
  }

  return articles.slice(0, 8)
}

async function fetchFirmPage(source: FirmPageSource): Promise<RawArticle[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Fortantis-NewsBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
      },
    })
    clearTimeout(timer)

    if (!response.ok) return []

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) return []

    const html = await response.text()

    // Skip JS-rendered sites (minimal HTML content)
    if (html.length < 5000) return []

    const articles = extractArticlesFromHtml(html, source)
    if (articles.length > 0) {
      console.log(`   ✓ ${source.name}: ${articles.length} publicaciones`)
    }
    return articles
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchAllFirmPages(): Promise<RawArticle[]> {
  const results = await Promise.allSettled(
    FIRM_PAGES.map((source) => fetchFirmPage(source))
  )

  const articles: RawArticle[] = []
  FIRM_PAGES.forEach((source, i) => {
    const result = results[i]
    if (result.status === 'fulfilled' && result.value.length > 0) {
      articles.push(...result.value)
    } else if (result.status === 'rejected') {
      console.warn(`   ✗ ${source.name}: error de scraping`)
    }
  })

  console.log(`   Total páginas de firmas: ${articles.length} publicaciones`)
  return articles
}
