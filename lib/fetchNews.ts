import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Fortantis-NewsBot/1.0' },
})

const RSS_SOURCES = [
  {
    name: 'Global Arbitration Review',
    url: 'https://globalarbitrationreview.com/rss',
    category: 'Arbitraje Internacional',
  },
  {
    name: 'ICC — Arbitration',
    url: 'https://iccwbo.org/feed/?cat=arbitration',
    category: 'Institucional',
  },
  {
    name: 'Kluwer Arbitration Blog',
    url: 'https://arbitrationblog.kluwerarbitration.com/feed',
    category: 'Doctrina y Análisis',
  },
  {
    name: 'JD Supra — International Arbitration',
    url: 'https://www.jdsupra.com/topics/international-arbitration/rss/',
    category: 'Noticias Legales',
  },
  {
    name: 'Herbert Smith Freehills — Arbitration',
    url: 'https://hsfnotes.com/arbitration/feed/',
    category: 'Doctrina y Análisis',
  },
  {
    name: 'Freshfields — Arbitration',
    url: 'https://arbitrationblog.freshfields.com/feed/',
    category: 'Doctrina y Análisis',
  },
  {
    name: 'Lexology — Arbitration',
    url: 'https://www.lexology.com/rss.ashx?topics=arbitration',
    category: 'Noticias Legales',
  },
  {
    name: 'Aceris Law — Arbitration',
    url: 'https://acerislaw.com/feed/',
    category: 'Doctrina y Análisis',
  },
  {
    name: 'GAR — Latin America',
    url: 'https://globalarbitrationreview.com/rss?region=latin-america',
    category: 'Arbitraje Internacional',
  },
  {
    name: 'White & Case — Insights',
    url: 'https://www.whitecase.com/feed',
    category: 'Boutique Global',
  },
  {
    name: 'Hogan Lovells — Insights',
    url: 'https://www.hoganlovells.com/feed',
    category: 'Boutique Global',
  },
  {
    name: 'Greenberg Traurig — Insights',
    url: 'https://gtlaw.com/en/feed',
    category: 'Boutique Global',
  },
  {
    name: 'Mattos Filho — Publicações',
    url: 'https://www.mattosfilho.com.br/feed/',
    category: 'Boutique LatAm',
  },
  {
    name: 'Three Crowns — Blog',
    url: 'https://www.threecrownsllp.com/feed/',
    category: 'Boutique Global',
  },
  {
    name: 'Aceris Law — Arbitration',
    url: 'https://acerislaw.com/feed/',
    category: 'Doctrina y Análisis',
  },
]

export interface RawArticle {
  title: string
  link: string
  contentSnippet: string
  pubDate: string
  source: string
  category: string
}

const FETCH_TIMEOUT_MS = 12000

function fetchWithHardTimeout(url: string): Promise<Parser.Output<Record<string, unknown>>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timeout after ${FETCH_TIMEOUT_MS}ms`)),
      FETCH_TIMEOUT_MS
    )
    parser
      .parseURL(url)
      .then((feed) => {
        clearTimeout(timer)
        resolve(feed)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

export async function fetchAllNews(): Promise<RawArticle[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 10)

  const results = await Promise.allSettled(
    RSS_SOURCES.map(async (source) => {
      const feed = await fetchWithHardTimeout(source.url)
      const recent = feed.items.filter((item) => {
        if (!item.pubDate) return true
        return new Date(item.pubDate) > cutoff
      })
      const articles: RawArticle[] = []
      for (const item of recent.slice(0, 10)) {
        if (!item.title || !item.link) continue
        articles.push({
          title: item.title.trim(),
          link: item.link,
          contentSnippet: item.contentSnippet?.slice(0, 500) ?? '',
          pubDate: item.pubDate ?? new Date().toISOString(),
          source: source.name,
          category: source.category,
        })
      }
      console.log(`   ✓ ${source.name}: ${recent.length} artículos`)
      return articles
    })
  )

  const articles: RawArticle[] = []
  RSS_SOURCES.forEach((source, i) => {
    const result = results[i]
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
    } else {
      console.warn(`   ✗ ${source.name}: ${result.reason?.message ?? 'Error desconocido'}`)
    }
  })

  // Ordenar por fecha descendente (más recientes primero)
  articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

  return articles
}
