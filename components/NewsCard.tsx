interface Article {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl: string
  publishedAt: string
  category: string
}

export default function NewsCard({ article, index }: { article: Article; index: number }) {
  return (
    <article
      className="fade-in bg-white flex flex-col"
      style={{
        animationDelay: `${index * 80}ms`,
        borderTop: '2px solid #C17F3E',
        boxShadow: '0 1px 4px rgba(13,38,69,0.06)',
      }}
    >
      <div style={{ padding: '28px 28px 24px' }} className="flex flex-col flex-1">

        {/* Category label — matches presentation style */}
        <div className="section-label" style={{ marginBottom: '16px' }}>
          {article.category}
        </div>

        {/* Title */}
        <h2
          style={{
            color: '#0D2645',
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: '1.45',
            fontFamily: "'Inter', sans-serif",
            flex: 1,
            marginBottom: '14px',
          }}
        >
          {article.title}
        </h2>

        {/* Summary */}
        <p
          style={{
            color: '#4A4A4A',
            fontSize: '0.845rem',
            lineHeight: '1.7',
            marginBottom: '22px',
          }}
        >
          {article.summary}
        </p>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #E8E0D5',
            paddingTop: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: '#8A8A8A', fontSize: '0.7rem', letterSpacing: '0.06em' }}>
              {article.source}
            </span>
            <span style={{ color: '#ABABAB', fontSize: '0.68rem' }}>
              {new Date(article.publishedAt).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long',
              })}
            </span>
          </div>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#C17F3E',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Fuente
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
        </div>

      </div>
    </article>
  )
}
