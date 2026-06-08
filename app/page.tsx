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
  whyItMatters?: string
  angleToMonitor?: string
}

interface NewsData {
  lastUpdated: string
  edition: number
  morningBrief?: string
  briefText?: string
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F0EBE3' }}>
      <Header />

      {/* Hero */}
      <section style={{ backgroundColor: '#0D2645', paddingTop: '56px', paddingBottom: '64px' }}>
        <div className="max-w-6xl mx-auto px-8">
          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(2rem, 4.5vw, 2.8rem)',
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Arbitraje Internacional
          </h1>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontStyle: 'normal',
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              color: '#C17F3E',
              marginTop: '10px',
              fontWeight: 300,
              letterSpacing: '0.01em',
            }}
          >
            Claridad rigurosa. Análisis que se sostiene.
          </div>
          {formattedDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
              <div style={{ width: '24px', height: '1px', backgroundColor: '#C17F3E' }} />
              <span style={{ color: '#6B88A8', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                Edición #{data.edition} · {formattedDate}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Separador */}
      <div style={{ height: '3px', backgroundColor: '#C17F3E' }} />

      {/* Morning Brief — solo si hay contenido */}
      {hasNews && data.morningBrief && (
        <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E0D5' }}>
          <div className="max-w-6xl mx-auto px-8 py-10">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '24px', height: '1px', backgroundColor: '#C17F3E' }} />
              <span
                style={{
                  color: '#9A8E84',
                  fontSize: '0.65rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Morning Brief
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                color: '#3A3A3A',
                lineHeight: 1.8,
                maxWidth: '780px',
                margin: 0,
                fontWeight: 300,
              }}
            >
              {data.morningBrief}
            </p>
          </div>
        </section>
      )}

      {/* Noticias */}
      <main style={{ flex: 1, backgroundColor: '#F0EBE3', paddingTop: '52px', paddingBottom: '80px' }}>
        <div className="max-w-6xl mx-auto px-8">
          {hasNews ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px' }}>
                <div style={{ width: '24px', height: '1px', backgroundColor: '#C17F3E' }} />
                <span
                  style={{
                    color: '#9A8E84',
                    fontSize: '0.68rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  {data.articles.length} señales seleccionadas
                </span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.articles.map((article, i) => (
                  <NewsCard key={article.id} article={article} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
              <div className="section-label" style={{ display: 'inline-flex', marginBottom: '24px' }}>
                Próxima edición
              </div>
              <h2
                style={{
                  color: '#0D2645',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 300,
                  fontSize: '1.6rem',
                  marginBottom: '16px',
                }}
              >
                En preparación
              </h2>
              <p
                style={{
                  color: '#7A7A7A',
                  fontSize: '0.9rem',
                  maxWidth: '400px',
                  margin: '0 auto',
                  lineHeight: '1.7',
                }}
              >
                El sistema recopila y procesa automáticamente las noticias más relevantes de arbitraje
                internacional cada martes y viernes a las 8:30 AM.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
