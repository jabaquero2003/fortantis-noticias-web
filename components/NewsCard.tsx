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

export default function NewsCard({ article, index }: { article: Article; index: number }) {
  return (
    <article
      className="fade-in bg-white flex flex-col"
      style={{
        animationDelay: `${index * 80}ms`,
        borderTop: '2px solid #C17F3E',
        boxShadow: '0 1px 3px rgba(13,38,69,0.07)',
      }}
    >
      <div style={{ padding: '26px 26px 22px' }} className="flex flex-col flex-1">

        <div className="section-label" style={{ marginBottom: '14px' }}>
          {article.category}
        </div>

        <h2
          style={{
            color: '#0D2645',
            fontSize: '0.97rem',
            fontWeight: 400,
            lineHeight: '1.5',
            fontFamily: "'Inter', sans-serif",
            marginBottom: '12px',
            flex: 1,
          }}
        >
          {article.title}
        </h2>

        <p
          style={{
            color: '#5A5A5A',
            fontSize: '0.83rem',
            lineHeight: '1.7',
            marginBottom: '20px',
          }}
        >
          {article.summary}
        </p>

        <div
          style={{
            borderTop: '1px solid #EAE3DA',
            paddingTop: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: '#8A8A8A', fontSize: '0.68rem', letterSpacing: '0.05em' }}>
              {article.source}
            </span>
            <span style={{ color: '#B0B0B0', fontSize: '0.65rem' }}>
              {new Date(article.publishedAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#C17F3E',
              fontSize: '0.68rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
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
