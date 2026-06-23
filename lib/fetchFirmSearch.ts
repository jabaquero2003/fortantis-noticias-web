import { RawArticle } from './fetchNews'

const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY
const BRAVE_URL = 'https://api.search.brave.com/res/v1/web/search'

interface BraveResult {
  title: string
  url: string
  description?: string
  page_age?: string
}

interface BraveResponse {
  web?: { results?: BraveResult[] }
}

interface FirmQuery {
  firm: string
  query: string
  category: string
}

const FIRM_QUERIES: FirmQuery[] = [
  // México — firmas
  { firm: 'Von Wobeser y Sierra', query: '"Von Wobeser" arbitraje arbitration publicación site:vonwobeser.com OR "Von Wobeser y Sierra" arbitraje', category: 'Boutique México' },
  { firm: 'González de Cossío Abogados', query: '"González de Cossío" arbitraje publicación arbitration site:gdca.com.mx OR "González de Cossío" arbitraje internacional', category: 'Boutique México' },
  { firm: 'Galicia Abogados', query: '"Galicia Abogados" arbitraje publicación site:galicia.mx OR "Galicia Abogados" arbitraje internacional México', category: 'Boutique México' },
  { firm: 'Creel García-Cuéllar Aiza y Enríquez', query: '"Creel" arbitraje publicación site:creel.mx OR "Creel García-Cuéllar" arbitraje México', category: 'Boutique México' },
  { firm: 'Basham Ringe y Correa', query: '"Basham" arbitraje publicación site:basham.com.mx OR "Basham Ringe" arbitraje México', category: 'Boutique México' },
  { firm: 'Santamarina y Steta', query: '"Santamarina y Steta" arbitraje publicación site:s-s.mx OR "Santamarina" arbitraje México', category: 'Boutique México' },
  { firm: 'Ritch Mueller', query: '"Ritch Mueller" arbitraje publicación site:ritch.com.mx OR "Ritch Mueller" arbitraje México', category: 'Boutique México' },
  // México — instituciones
  { firm: 'CAM México', query: 'site:arbitrajecam.com arbitraje noticias OR "Centro de Arbitraje de México" noticias laudo', category: 'Institucional' },
  { firm: 'ICC México', query: 'site:iccmex.mx publicaciones OR "ICC México" arbitraje publicación evento', category: 'Institucional' },
  // LatAm — boutiques especializadas
  { firm: 'Jana & Gil Dispute Resolution', query: '"Jana & Gil" arbitraje publicación Chile OR "Jana Gil" arbitration publication', category: 'Boutique LatAm' },
  { firm: 'Bullard Falla Ezcurra+', query: 'site:bullardabogados.pe publicaciones arbitraje OR "Bullard Falla" arbitraje publicación Perú', category: 'Boutique LatAm' },
  { firm: 'Posse Herrera Ruiz', query: 'site:phrlegal.com arbitraje publicaciones OR "Posse Herrera Ruiz" arbitraje Colombia', category: 'Boutique LatAm' },
  { firm: "Marval O'Farrell Mairal", query: 'site:marval.com arbitraje publicaciones OR "Marval" arbitraje Argentina publicación', category: 'Boutique LatAm' },
  { firm: 'Carey', query: 'site:carey.cl arbitraje publicaciones OR "Carey abogados" arbitraje Chile publicación', category: 'Boutique LatAm' },
  { firm: 'Claro & Cía', query: '"Claro y Cía" arbitraje publicación Chile OR "Claro & Cía" arbitration Chile', category: 'Boutique LatAm' },
  { firm: 'Miranda & Amado', query: 'site:miranda-amado.com arbitraje publicaciones OR "Miranda & Amado" arbitraje Perú', category: 'Boutique LatAm' },
  { firm: 'Rodrigo Elías & Medrano', query: 'site:estudiorodrigo.com arbitraje OR "Rodrigo Elías Medrano" arbitraje Perú publicación', category: 'Boutique LatAm' },
  { firm: 'FERRERE', query: 'site:ferrere.com arbitraje publicaciones OR "FERRERE abogados" arbitraje Uruguay Paraguay', category: 'Boutique LatAm' },
  { firm: 'Demarest', query: 'site:demarest.com.br arbitragem publicações OR "Demarest" arbitragem Brasil publicação', category: 'Boutique LatAm' },
  { firm: 'Philippi Prietocarrizosa Ferrero DU & Uría', query: '"Philippi" arbitraje publicación Chile Colombia site:ppulegal.com OR "Philippi Prietocarrizosa" arbitraje', category: 'Boutique LatAm' },
  // LatAm — instituciones
  { firm: 'CAM Santiago', query: 'site:camsantiago.com noticias arbitraje laudo OR "CAM Santiago" arbitraje noticias', category: 'Institucional' },
  { firm: 'Centro de Arbitraje de Colombia', query: '"centro de arbitraje" Colombia arbitraje laudo noticias OR "Cámara de Comercio" Colombia arbitraje noticias', category: 'Institucional' },
  // Global boutiques especializadas sin RSS confirmado
  { firm: 'Three Crowns LLP', query: 'site:threecrownsllp.com arbitration publication OR "Three Crowns" arbitration publication insight', category: 'Boutique Global' },
  { firm: 'Chaffetz Lindsey', query: 'site:chaffetzlindsey.com arbitration publication OR "Chaffetz Lindsey" arbitration publication', category: 'Boutique Global' },
  { firm: 'Volterra Fietta', query: 'site:volterrafietta.com arbitration publication OR "Volterra Fietta" arbitration investment', category: 'Boutique Global' },
]

async function searchFirm(q: FirmQuery): Promise<RawArticle[]> {
  try {
    const params = new URLSearchParams({
      q: q.query,
      count: '5',
      freshness: 'pw',
    })

    const response = await fetch(`${BRAVE_URL}?${params}`, {
      headers: {
        'X-Subscription-Token': BRAVE_API_KEY!,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) return []

    const data: BraveResponse = await response.json()
    const results = data.web?.results ?? []

    return results
      .filter(r => r.title && r.url)
      .map(r => ({
        title: r.title,
        link: r.url,
        contentSnippet: r.description ?? '',
        pubDate: r.page_age ?? new Date().toISOString(),
        source: q.firm,
        category: q.category,
      }))
  } catch {
    return []
  }
}

export async function fetchFirmSearchResults(): Promise<RawArticle[]> {
  if (!BRAVE_API_KEY) {
    console.log('   BRAVE_SEARCH_API_KEY no configurada — omitiendo búsqueda web de firmas')
    return []
  }

  // Sequential with small delay to respect rate limits
  const articles: RawArticle[] = []
  let successCount = 0

  for (const q of FIRM_QUERIES) {
    const results = await searchFirm(q)
    if (results.length > 0) {
      articles.push(...results)
      successCount++
    }
    // Small delay between requests
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`   Brave Search: ${articles.length} publicaciones de ${successCount}/${FIRM_QUERIES.length} firmas`)
  return articles
}
