import React from 'react'
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
}

interface NewsData {
  lastUpdated: string
  edition: number
  morningBrief?: string
  briefText?: string
  articles: Article[]
}

const data = newsData as NewsData

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
      <div style={{ width: '20px', height: '1px', backgroundColor: '#C17F3E' }} />
      <span style={{
        color: '#9A8E84',
        fontSize: '0.62rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>
        {children}
      </span>
    </div>
  )
}

function extractBriefSection(briefText: string, sectionNumber: number): string {
  const marker = `## ${sectionNumber}.`
  const nextMarker = `## ${sectionNumber + 1}.`
  const start = briefText.indexOf(marker)
  if (start === -1) return ''
  const end = briefText.indexOf(nextMarker)
  const raw = end === -1 ? briefText.slice(start) : briefText.slice(start, end)
  const firstNewline = raw.indexOf('\n')
  return firstNewline === -1 ? '' : raw.slice(firstNewline).trim()
}

function renderBriefSection(text: string): React.ReactNode[] {
  if (!text) return []
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let key = 0
  let listItems: string[] = []

  function flushList() {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={key++} style={{ margin: '8px 0 16px 0', paddingLeft: '0', listStyle: 'none' }}>
          {listItems.map((item, i) => (
            <li key={i} style={{
              fontSize: '0.88rem',
              color: '#4A4A4A',
              lineHeight: '1.7',
              paddingLeft: '16px',
              borderLeft: '2px solid #E8E0D5',
              marginBottom: '6px',
            }}
              dangerouslySetInnerHTML={{ __html: parseInline(item) }}
            />
          ))}
        </ul>
      )
      listItems = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('* ') && !trimmed.startsWith('- ')) flushList()

    if (trimmed.startsWith('### ')) {
      const text = parseInline(trimmed.slice(4))
      nodes.push(
        <h3 key={key++} style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#0D2645',
          marginTop: '28px',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid #E8E0D5',
        }} dangerouslySetInnerHTML={{ __html: text }} />
      )
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      listItems.push(parseInline(trimmed.slice(2)))
    } else if (trimmed === '' || trimmed === '---') {
      nodes.push(<div key={key++} style={{ height: '6px' }} />)
    } else if (/^\*\*[^*]+:\*\*/.test(trimmed)) {
      const match = trimmed.match(/^\*\*([^*]+):\*\*\s*(.*)/)
      if (match) {
        nodes.push(
          <div key={key++} style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.62rem', color: '#9A8E84', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', paddingTop: '2px' }}>
              {match[1]}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#0D2645' }}
              dangerouslySetInnerHTML={{ __html: parseInline(match[2]) }} />
          </div>
        )
      }
    } else if (trimmed) {
      nodes.push(
        <p key={key++} style={{
          fontSize: '0.88rem',
          color: '#4A4A4A',
          lineHeight: '1.75',
          margin: '6px 0 10px',
          fontFamily: "'Inter', sans-serif",
        }} dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }} />
      )
    }
  }
  flushList()
  return nodes
}

function parseInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0D2645;font-weight:600;">$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C17F3E;text-decoration:none;border-bottom:1px solid #E8C88E;">$1</a>')
}

export default function Home() {
  const hasNews = data.articles.length > 0

  const formattedDate = data.lastUpdated
    ? new Date(data.lastUpdated).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const latamText = data.briefText ? extractBriefSection(data.briefText, 3) : ''
  const quantumText = data.briefText ? extractBriefSection(data.briefText, 4) : ''
  const firmasText = data.briefText ? extractBriefSection(data.briefText, 5) : ''
  const oportunidadText = data.briefText ? extractBriefSection(data.briefText, 6) : ''
  const sourcesText = data.briefText ? extractBriefSection(data.briefText, 7) : ''

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F0EBE3' }}>
      <Header />

      {/* Hero */}
      <section style={{ backgroundColor: '#0D2645', padding: '60px 0 68px' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 40px' }}>
          <h1 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(2rem, 4.5vw, 2.8rem)',
            color: '#FFFFFF',
            letterSpacing: '0.02em',
            lineHeight: 1.2,
            margin: 0,
          }}>
            Arbitraje Internacional
          </h1>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
            color: '#C17F3E',
            marginTop: '10px',
            fontWeight: 300,
          }}>
            Claridad rigurosa. Análisis que se sostiene.
          </div>
          {formattedDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '28px' }}>
              <div style={{ width: '20px', height: '1px', backgroundColor: '#C17F3E' }} />
              <span style={{ color: '#6B88A8', fontSize: '0.75rem', letterSpacing: '0.06em' }}>
                Edición #{data.edition} · {formattedDate}
              </span>
            </div>
          )}
        </div>
      </section>

      <div style={{ height: '3px', backgroundColor: '#C17F3E' }} />

      {hasNews ? (
        <>
          {/* Apertura */}
          {data.morningBrief && (
            <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E0D5' }}>
              <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '48px 40px' }}>
                <SectionLabel>Apertura</SectionLabel>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(0.92rem, 1.4vw, 1.02rem)',
                  color: '#2A2A2A',
                  lineHeight: 1.85,
                  maxWidth: '760px',
                  margin: 0,
                  fontWeight: 300,
                }}>
                  {data.morningBrief}
                </p>
              </div>
            </section>
          )}

          {/* Señales Principales */}
          <section style={{ backgroundColor: '#F0EBE3', padding: '52px 0 60px' }}>
            <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 40px' }}>
              <SectionLabel>Señales Principales</SectionLabel>
              <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {data.articles.map((article, i) => (
                  <NewsCard key={article.id} article={article} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* LatAm Radar */}
          {latamText && (
            <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E8E0D5', borderBottom: '1px solid #E8E0D5' }}>
              <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '48px 40px' }}>
                <SectionLabel>LatAm Radar</SectionLabel>
                <div style={{ maxWidth: '760px' }}>
                  {renderBriefSection(latamText)}
                </div>
              </div>
            </section>
          )}

          {/* Quantum & Daños */}
          {quantumText && (
            <section style={{ backgroundColor: '#F7F4F0', borderBottom: '1px solid #E8E0D5' }}>
              <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '48px 40px' }}>
                <SectionLabel>Quantum & Daños</SectionLabel>
                <div style={{ maxWidth: '760px' }}>
                  {renderBriefSection(quantumText)}
                </div>
              </div>
            </section>
          )}

          {/* Firmas e Instituciones */}
          {firmasText && (
            <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E0D5' }}>
              <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '48px 40px' }}>
                <SectionLabel>Firmas e Instituciones</SectionLabel>
                <div style={{ maxWidth: '760px' }}>
                  {renderBriefSection(firmasText)}
                </div>
              </div>
            </section>
          )}

          {/* Oportunidad de Contenido */}
          {oportunidadText && (
            <section style={{ backgroundColor: '#F7F4F0', borderBottom: '1px solid #E8E0D5' }}>
              <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '48px 40px' }}>
                <SectionLabel>Oportunidad de Contenido</SectionLabel>
                <div style={{ maxWidth: '760px' }}>
                  {renderBriefSection(oportunidadText)}
                </div>
              </div>
            </section>
          )}

          {/* Fuentes */}
          {sourcesText && (
            <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E0D5' }}>
              <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '40px 40px' }}>
                <SectionLabel>Fuentes</SectionLabel>
                <div style={{ maxWidth: '760px' }}>
                  {renderBriefSection(sourcesText)}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <main style={{ flex: 1, backgroundColor: '#F0EBE3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="section-label" style={{ display: 'inline-flex', marginBottom: '24px' }}>
              Próxima edición
            </div>
            <h2 style={{ color: '#0D2645', fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '1.5rem', marginBottom: '16px' }}>
              En preparación
            </h2>
            <p style={{ color: '#7A7A7A', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto', lineHeight: '1.75' }}>
              El sistema publica automáticamente las noticias más relevantes de arbitraje internacional cada martes y viernes a las 8:30 AM.
            </p>
          </div>
        </main>
      )}

      <Footer />
    </div>
  )
}
