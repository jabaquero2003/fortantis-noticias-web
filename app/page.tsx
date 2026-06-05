import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsCard from '@/components/NewsCard'
import newsData from '@/data/news.json'

export const revalidate = 0

interface Article {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl: string
  publishedAt: string
  category: string
}

interface NewsData {
  lastUpdated: string
  edition: number
  articles: Article[]
}

const data = newsData as NewsData

export default function Home() {
  const hasNews = data.articles.length > 0

  const formattedDate = data.lastUpdated
    ? new Date(data.lastUpdated).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section style={{ backgroundColor: '#0D2645', paddingBottom: '60px' }}>
          <div className="max-w-6xl mx-auto px-8 pt-14 pb-12 text-center">
            <p style={{ color: '#C17F3E', fontSize: '0.75rem', letterSpacing: '0.2em' }} className="uppercase font-sans mb-3">
              Boletín de Noticias
            </p>
            <h1
              style={{ color: '#FFFFFF', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 300, letterSpacing: '0.03em', lineHeight: 1.3 }}
              className="font-sans"
            >
              Arbitraje Internacional
            </h1>
            {formattedDate && (
              <p style={{ color: '#8BA0BB', fontSize: '0.85rem', marginTop: '12px' }}>
                Edición #{data.edition} · {formattedDate}
              </p>
            )}
            <div style={{ width: '48px', height: '2px', backgroundColor: '#C17F3E', margin: '24px auto 0' }} />
          </div>
        </section>

        {/* Wave separator */}
        <div style={{ backgroundColor: '#F8F5F0', marginTop: '-1px' }}>
          <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', backgroundColor: '#0D2645' }}>
            <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" fill="#F8F5F0"/>
          </svg>
        </div>

        {/* News section */}
        <section style={{ backgroundColor: '#F8F5F0', paddingTop: '40px', paddingBottom: '60px' }}>
          <div className="max-w-6xl mx-auto px-8">
            {hasNews ? (
              <>
                <p style={{ color: '#9CA3AF', fontSize: '0.8rem', letterSpacing: '0.1em' }} className="uppercase font-sans mb-8 text-center">
                  {data.articles.length} noticias seleccionadas
                </p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {data.articles.map((article, i) => (
                    <NewsCard key={article.id} article={article} index={i} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-24">
                <div style={{ width: '64px', height: '64px', margin: '0 auto 24px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#C17F3E" strokeWidth="1">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h2 style={{ color: '#0D2645', fontSize: '1.3rem', fontWeight: 300 }} className="font-sans mb-3">
                  Próxima edición en preparación
                </h2>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto' }}>
                  El sistema recopila y procesa las noticias más relevantes de arbitraje internacional cada martes y viernes a las 8:30 AM.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
