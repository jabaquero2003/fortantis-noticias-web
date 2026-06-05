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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F0EBE3' }}>
      <Header />

      {/* Hero — dark navy */}
      <section style={{ backgroundColor: '#0D2645' }}>
        <div className="max-w-6xl mx-auto px-8 pt-16 pb-20">

          {/* Section label — matches presentation */}
          <div className="section-label" style={{ marginBottom: '20px' }}>
            Boletín de Noticias
          </div>

          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              lineHeight: 1.2,
            }}
          >
            Arbitraje Internacional
          </h1>

          {/* Copper italic accent — like the presentation headlines */}
          <div
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              color: '#C17F3E',
              marginTop: '8px',
              fontWeight: 300,
            }}
          >
            Claridad rigurosa. Análisis que se sostiene.
          </div>

          {formattedDate && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '28px',
              }}
            >
              <div style={{ width: '28px', height: '1px', backgroundColor: '#C17F3E' }} />
              <span style={{ color: '#6B88A8', fontSize: '0.8rem', letterSpacing: '0.08em' }}>
                Edición #{data.edition} · {formattedDate}
              </span>
            </div>
          )}
        </div>

        {/* Wave to cream */}
        <svg viewBox="0 0 1440 36" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
          <path d="M0,36 L0,18 Q360,0 720,18 Q1080,36 1440,18 L1440,36 Z" fill="#F0EBE3"/>
        </svg>
      </section>

      {/* News section — cream */}
      <main style={{ flex: 1, backgroundColor: '#F0EBE3', paddingTop: '40px', paddingBottom: '80px' }}>
        <div className="max-w-6xl mx-auto px-8">

          {hasNews ? (
            <>
              {/* Count label */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '36px',
                }}
              >
                <div style={{ width: '28px', height: '1px', backgroundColor: '#C17F3E' }} />
                <span
                  style={{
                    color: '#9A8E84',
                    fontSize: '0.68rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  {data.articles.length} noticias seleccionadas esta semana
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.articles.map((article, i) => (
                  <NewsCard key={article.id} article={article} index={i} />
                ))}
              </div>
            </>
          ) : (
            /* Empty state */
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
              <p style={{ color: '#7A7A7A', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto', lineHeight: '1.7' }}>
                El sistema recopila y procesa automáticamente las noticias más relevantes de arbitraje internacional cada martes y viernes a las 8:30 AM.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
