import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'Fortantis-NewsBot/1.0' },
})

const RSS_SOURCES = [
  {
    name: 'Kluwer Arbitration Blog',
    url: 'https://arbitrationblog.kluwerarbitration.com/feed/',
    category: 'Doctrina y Análisis',
  },
  {
    name: 'JD Supra — Arbitraje',
    url: 'https://www.jdsupra.com/topics/international-arbitration/?feed=rss',
    category: 'Noticias Legales',
  },
  {
    name: 'Lexology — Arbitration',
    url: 'https://www.lexology.com/api/rss/topic?topic=arbitration',
    category: 'Noticias Legales',
  },
  {
    name: 'Global Arbitration Review',
    url: 'https://globalarbitrationreview.com/rss',
    category: 'Arbitraje Internacional',
  },
  {
    name: 'ICSID — Banco Mundial',
    url: 'https://icsid.worldbank.org/news/rss',
    category: 'Inversión Internacional',
  },
  {
    name: 'ICC — Arbitration',
    url: 'https://iccwbo.org/feed/?cat=arbitration',
    category: 'Institucional',
  },
  {
    name: 'Investment Claims',
    url: 'https://www.investmentclaims.com/feed',
    category: 'Inversión Internacional',
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

export async function fetchAllNews(): Promise<RawArticle[]> {
  const articles: RawArticle[] = []
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 5)

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)
      const recent = feed.items.filter((item) => {
        if (!item.pubDate) return true
        return new Date(item.pubDate) > twoDaysAgo
      })

      for (const item of recent.slice(0, 6)) {
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

      console.log(`✓ ${source.name}: ${recent.length} artículos`)
    } catch (err) {
      console.warn(`✗ ${source.name}: ${(err as Error).message}`)
    }
  }

  return articles
}
