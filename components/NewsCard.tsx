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
  const delay = `${index * 80}ms`

  return (
    <article
      className="fade-in bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden"
      style={{ animationDelay: delay, borderTop: '3px solid #C17F3E' }}
    >
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span
            style={{ backgroundColor: '#0D2645', color: '#C17F3E', fontSize: '0.65rem', letterSpacing: '0.12em' }}
            className="uppercase px-2 py-1 rounded-sm font-sans font-medium"
          >
            {article.category}
          </span>
          <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
            {new Date(article.publishedAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        <h2
          style={{ color: '#0D2645', fontSize: '1.05rem', lineHeight: '1.4', fontWeight: 400 }}
          className="font-sans mb-3 flex-1"
        >
          {article.title}
        </h2>

        <p style={{ color: '#5A5A5A', fontSize: '0.875rem', lineHeight: '1.65' }} className="mb-5">
          {article.summary}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: '1px solid #E8E0D5' }}>
          <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }} className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            {article.source}
          </span>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#C17F3E', fontSize: '0.8rem', letterSpacing: '0.05em' }}
            className="font-sans uppercase hover:underline flex items-center gap-1"
          >
            Leer fuente
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
  )
}
