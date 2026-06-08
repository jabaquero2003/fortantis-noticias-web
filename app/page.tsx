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

function SectionLabel({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
      <div style={{ width: '24px', height: '2px', backgroundColor: '#C17F3E', flexShrink: 0 }} />
      <span style={{
        color: light ? '#6B88A8' : '#9A8E84',
        fontSize: '0.6rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        fontWeight: 700,
        fontFamily: "'Inter', sans-serif",
      }}>
        {children}
      </span>
    </div>
  )
}

function extractBriefSection(briefText: string, marker: string, nextMarker: string): string {
  const start = briefText.indexOf(marker)
  if (start === -1) return ''
  const end = nextMarker ? briefText.indexOf(nextMarker, start + marker.length) : -1
  const raw = end === -1 ? briefText.slice(start) : briefText.slice(start, end)
  const firstNewline = raw.indexOf('\n')
  return firstNewline === -1 ? '' : raw.slice(firstNewline).trim()
}

function parseInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0D2645;font-weight:600;">$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C17F3E;text-decoration:none;border-bottom:1px solid rgba(193,127,62,0.3);">$1</a>')
}

function renderSection(text: string): React.ReactNode[] {
  if (!text) return []
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let key = 0
  let listItems: string[] = []

  function flushList() {
    if (listItems.length === 0) return
    nodes.push(
      <ul key={key++} style={{ margin: '10px 0 20px', padding: 0, listStyle: 'none' }}>
        {listItems.map((item, i) => (
          <li key={i} style={{
            fontSize: '0.87rem', color: '#4A4A4A', lineHeight: '1.7',
            padding: '6px 0 6px 18px', borderLeft: '2px solid #E8E0D5', marginBottom: '6px',
          }} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
        ))}
      </ul>
    )
    listItems = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('* ') && !trimmed.startsWith('- ')) flushList()

    if (trimmed.startsWith('### ')) {
      const content = parseInline(trimmed.slice(4))
      nodes.push(
        <h3 key={key++} style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', fontWeight: 600,
          color: '#0D2645', marginTop: '28px', marginBottom: '10px',
          paddingBottom: '8px', borderBottom: '1px solid #E8E0D5',
        }} dangerouslySetInnerHTML={{ __html: content }} />
      )
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      listItems.push(parseInline(trimmed.slice(2)))
    } else if (trimmed === '' || trimmed === '---') {
      nodes.push(<div key={key++} style={{ height: '8px' }} />)
    } else if (trimmed.startsWith('**Fuente:**') || trimmed.startsWith('**Fuente:')) {
      nodes.push(
        <div key={key++} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '8px 0 12px', fontSize: '0.75rem', color: '#9A8E84' }}
          dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }} />
      )
    } else if (trimmed) {
      nodes.push(
        <p key={key++} style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#4A4A4A',
          lineHeight: '1.78', margin: '6px 0 12px',
        }} dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }} />
      )
    }
  }
  flushList()
  return nodes
}

function editionLabel(lastUpdated: string): string {
  const date = new Date(lastUpdated)
  const day = date.getDay() // 0=Sun, 1=Mon, 2=Tue, ..., 5=Fri
  if (day === 2 || day === 5) return ''
  return process.env.NODE_ENV === 'production' ? 'Edición Especial' : 'Edición de Prueba'
}

export default function Home() {
  const hasNews = data.articles && data.articles.length > 0

  const formattedDate = data.lastUpdated
    ? new Date(data.lastUpdated).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const label = data.lastUpdated ? editionLabel(data.lastUpdated) : null

  const top3 = data.articles ? data.articles.slice(0, 3) : []

  const briefText = data.briefText ?? ''

  const signalsText  = extractBriefSection(briefText, '## 2.', '## 3.')
  const latamText    = extractBriefSection(briefText, '## 3.', '## 4.')
  const quantumText  = extractBriefSection(briefText, '## 4.', '## 5.')
  const firmasText   = extractBriefSection(briefText, '## 5.', '## 6.')
  const oportunText  = extractBriefSection(briefText, '## 6.', '## 7.')
  const sourcesText  = extractBriefSection(briefText, '## 7.', '')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F0EBE3' }}>
      <Header />

      {/* HERO */}
      <section style={{ backgroundColor: '#0D2645', padding: '56px 0 64px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
          {label && (
            <div style={{
              display: 'inline-block', border: '1px solid #C17F3E', color: '#C17F3E',
              fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '4px 12px', marginBottom: '20px', fontFamily: "'Inter', sans-serif",
            }}>
              {label}
            </div>
          )}
          <h1 style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 200,
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#FFFFFF',
            letterSpacing: '0.04em', lineHeight: 1.15, margin: 0,
          }}>
            Noticiero Fortantis
          </h1>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#C17F3E', marginTop: '10px', fontWeight: 300, letterSpacing: '0.03em' }}>
            Claridad rigurosa. Análisis que se sostiene.
          </div>
          {formattedDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
              <div style={{ width: '20px', height: '1px', backgroundColor: '#C17F3E' }} />
              <span style={{ color: '#4A6A8A', fontSize: '0.72rem', letterSpacing: '0.06em', fontFamily: "'Inter', sans-serif" }}>
                Edición #{data.edition} · {formattedDate}
              </span>
            </div>
          )}
        </div>
      </section>

      <div style={{ height: '3px', backgroundColor: '#C17F3E' }} />

      {hasNews ? (
        <>
          {/* MORNING BRIEF */}
          {data.morningBrief && (
            <section style={{ backgroundColor: '#FFFFFF' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '52px 40px' }}>
                <SectionLabel>Morning Brief</SectionLabel>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(0.92rem, 1.3vw, 1.02rem)',
                  color: '#2A2A2A', lineHeight: 1.85, maxWidth: '720px',
                  margin: 0, fontWeight: 300,
                }}>
                  {data.morningBrief}
                </p>
              </div>
            </section>
          )}

          {/* TOP 3 SIGNALS — tarjetas resumen */}
          <section style={{ backgroundColor: '#F0EBE3', padding: '52px 0 20px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
              <SectionLabel>Señales Principales</SectionLabel>
              <div style={{
                display: 'grid', gap: '22px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              }}>
                {top3.map((article, i) => (
                  <NewsCard key={article.id} article={article} index={i} signalNumber={i + 1} />
                ))}
              </div>
            </div>
          </section>

          {/* ANÁLISIS COMPLETO DE LAS SEÑALES — texto completo para leer en la página */}
          {signalsText && (
            <section style={{ backgroundColor: '#F0EBE3', padding: '20px 0 60px' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
                <div style={{ maxWidth: '740px' }}>
                  {renderSection(signalsText)}
                </div>
              </div>
            </section>
          )}

          {/* LATAM RADAR */}
          {latamText && (
            <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E8E0D5' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '52px 40px' }}>
                <SectionLabel>LatAm Radar</SectionLabel>
                <div style={{ maxWidth: '740px' }}>
                  {renderSection(latamText)}
                </div>
              </div>
            </section>
          )}

          {/* QUANTUM & DAÑOS */}
          {quantumText && (
            <section style={{ backgroundColor: '#F7F4F0', borderTop: '1px solid #E8E0D5' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '52px 40px' }}>
                <SectionLabel>Quantum & Daños</SectionLabel>
                <div style={{ maxWidth: '740px' }}>
                  {renderSection(quantumText)}
                </div>
              </div>
            </section>
          )}

          {/* FIRMAS E INSTITUCIONES */}
          {firmasText && (
            <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E8E0D5' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '52px 40px' }}>
                <SectionLabel>Firmas e Instituciones</SectionLabel>
                <div style={{ maxWidth: '740px' }}>
                  {renderSection(firmasText)}
                </div>
              </div>
            </section>
          )}

          {/* OPORTUNIDAD DE CONTENIDO */}
          {oportunText && (
            <section style={{ backgroundColor: '#F7F4F0', borderTop: '1px solid #E8E0D5' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '52px 40px' }}>
                <SectionLabel>Oportunidad de Contenido</SectionLabel>
                <div style={{ maxWidth: '740px' }}>
                  {renderSection(oportunText)}
                </div>
              </div>
            </section>
          )}

          {/* FUENTES */}
          {sourcesText && (
            <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E8E0D5' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 40px 52px' }}>
                <SectionLabel>Fuentes</SectionLabel>
                <div style={{ maxWidth: '740px' }}>
                  {renderSection(sourcesText)}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#C17F3E', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Próxima edición
            </div>
            <h2 style={{ color: '#0D2645', fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '1.4rem', marginBottom: '14px' }}>
              En preparación
            </h2>
            <p style={{ color: '#7A7A7A', fontSize: '0.86rem', maxWidth: '360px', margin: '0 auto', lineHeight: '1.75' }}>
              El sistema publica automáticamente cada martes y viernes a las 8:30 AM.
            </p>
          </div>
        </main>
      )}

      <Footer />
    </div>
  )
}
