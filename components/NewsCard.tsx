interface Article {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl: string
  publishedAt: string
  category: string
  whyItMatters?: string
}

const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  'Inversión Internacional': { bg: '#1A4A7A', color: '#FFFFFF' },
  'Arbitraje Comercial':     { bg: '#2A5C3E', color: '#FFFFFF' },
  'Doctrina y Análisis':     { bg: '#5A3A1A', color: '#FFFFFF' },
  'Institucional':           { bg: '#3A2A5C', color: '#FFFFFF' },
  'Regulación':              { bg: '#4A3A1A', color: '#FFFFFF' },
}

export default function NewsCard({
  article,
  index,
  signalNumber,
}: {
  article: Article
  index: number
  signalNumber?: number
}) {
  const catStyle = CATEGORY_STYLES[article.category] ?? { bg: '#2A3A4A', color: '#FFFFFF' }

  const formattedDate = (() => {
    try {
      return new Date(article.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
    } catch {
      return article.publishedAt
    }
  })()

  return (
    <article
      className="fade-in"
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '2px solid #C17F3E',
        display: 'flex',
        flexDirection: 'column',
        animationDelay: `${index * 80}ms`,
        boxShadow: '0 1px 4px rgba(13,38,69,0.06)',
      }}
    >
      <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Signal number + category badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          {signalNumber && (
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.58rem', letterSpacing: '0.2em',
              color: '#C17F3E', textTransform: 'uppercase', fontWeight: 700,
            }}>
              Signal {signalNumber}
            </span>
          )}
          <span style={{
            backgroundColor: catStyle.bg, color: catStyle.color,
            fontSize: '0.58rem', letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '3px 8px', fontFamily: "'Inter', sans-serif", fontWeight: 600,
            marginLeft: signalNumber ? '8px' : '0',
          }}>
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          color: '#0D2645', fontSize: '0.95rem', fontWeight: 500,
          lineHeight: '1.48', fontFamily: "'Inter', sans-serif",
          marginBottom: '12px', flex: 1,
        }}>
          {article.title}
        </h2>

        {/* Summary */}
        <p style={{
          color: '#5A5A5A', fontSize: '0.82rem', lineHeight: '1.68',
          marginBottom: '20px', fontFamily: "'Inter', sans-serif",
        }}>
          {article.summary}
        </p>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #EAE3DA', paddingTop: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: '#8A8A8A', fontSize: '0.67rem', letterSpacing: '0.04em', fontFamily: "'Inter', sans-serif" }}>
              {article.source}
            </span>
            <span style={{ color: '#B0B0B0', fontSize: '0.64rem', fontFamily: "'Inter', sans-serif" }}>
              {formattedDate}
            </span>
          </div>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#C17F3E', fontSize: '0.67rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '4px',
              textDecoration: 'none', fontFamily: "'Inter', sans-serif",
            }}
          >
            Leer
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        </div>

      </div>
    </article>
  )
}
