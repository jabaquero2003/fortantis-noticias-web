import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
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

const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  'Inversión Internacional': { bg: '#1A4A7A', color: '#FFFFFF' },
  'Arbitraje Comercial':     { bg: '#0D2645', color: '#FFFFFF' },
  'Doctrina y Análisis':     { bg: '#5A3A1A', color: '#FFFFFF' },
  'Institucional':           { bg: '#3A2A5C', color: '#FFFFFF' },
  'Regulación':              { bg: '#4A3A1A', color: '#FFFFFF' },
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px' }}>
      <div style={{ width: '24px', height: '2px', backgroundColor: '#C17F3E', flexShrink: 0 }} />
      <span style={{
        color: '#9A8E84', fontSize: '0.6rem', letterSpacing: '0.22em',
        textTransform: 'uppercase', fontWeight: 700, fontFamily: "'Inter', sans-serif",
      }}>
        {children}
      </span>
    </div>
  )
}

function parseInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0D2645;font-weight:600;">$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C17F3E;text-decoration:none;border-bottom:1px solid rgba(193,127,62,0.35);">$1</a>')
}

function renderParagraphs(text: string, skipFuenteLine = false): React.ReactNode[] {
  if (!text) return []
  const nodes: React.ReactNode[] = []
  let key = 0
  let listItems: string[] = []

  function flushList() {
    if (listItems.length === 0) return
    nodes.push(
      <ul key={key++} style={{ margin: '10px 0 20px', padding: 0, listStyle: 'none' }}>
        {listItems.map((item, i) => (
          <li key={i} style={{
            fontSize: '0.88rem', color: '#4A4A4A', lineHeight: '1.75',
            padding: '6px 0 6px 18px', borderLeft: '2px solid #E0D8CF', marginBottom: '6px',
            fontFamily: "'Inter', sans-serif",
          }} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
        ))}
      </ul>
    )
    listItems = []
  }

  for (const line of text.split('\n')) {
    const t = line.trim()
    if (skipFuenteLine && /^\*\*Fuente:?\*\*/i.test(t)) continue
    if (!t.startsWith('* ') && !t.startsWith('- ')) flushList()

    if (!t || t === '---') {
      nodes.push(<div key={key++} style={{ height: '10px' }} />)
    } else if (t.startsWith('* ') || t.startsWith('- ')) {
      listItems.push(parseInline(t.slice(2)))
    } else if (t.startsWith('## ')) {
      nodes.push(
        <h3 key={key++} style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', fontWeight: 600,
          color: '#0D2645', letterSpacing: '0.04em',
          marginTop: '28px', marginBottom: '10px',
        }} dangerouslySetInnerHTML={{ __html: parseInline(t.slice(3)) }} />
      )
    } else if (t.startsWith('### ')) {
      nodes.push(
        <h4 key={key++} style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 600,
          color: '#6B88A8', letterSpacing: '0.08em', textTransform: 'uppercase',
          marginTop: '24px', marginBottom: '8px',
        }} dangerouslySetInnerHTML={{ __html: parseInline(t.slice(4)) }} />
      )
    } else if (/^\*\*[^*]+:\*\*\s*$/.test(t)) {
      const labelText = t.replace(/^\*\*([^*]+):\*\*\s*$/, '$1')
      nodes.push(
        <div key={key++} style={{
          fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#B8AFA5', fontWeight: 700, marginTop: '18px', marginBottom: '3px',
          fontFamily: "'Inter', sans-serif",
        }}>
          {labelText}
        </div>
      )
    } else {
      nodes.push(
        <p key={key++} style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#3A3A3A',
          lineHeight: '1.82', margin: '0 0 14px',
        }} dangerouslySetInnerHTML={{ __html: parseInline(t) }} />
      )
    }
  }
  flushList()
  return nodes
}

// Extrae cada señal individual de la sección 2 del briefText
function extractIndividualSignals(briefText: string): { title: string; body: string; article?: Article }[] {
  const sec2Start = briefText.indexOf('## 2.')
  if (sec2Start === -1) return []
  const sec3Start = briefText.indexOf('## 3.', sec2Start)
  const section2 = sec3Start === -1 ? briefText.slice(sec2Start) : briefText.slice(sec2Start, sec3Start)

  // Dividir por subsecciones ### Signal N: o ### [título]
  const parts = section2.split(/\n(?=### )/)
  const signals: { title: string; body: string; article?: Article }[] = []

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed.startsWith('### ')) continue
    const firstNewline = trimmed.indexOf('\n')
    if (firstNewline === -1) continue
    const rawTitle = trimmed.slice(4, firstNewline).trim()
    // Quitar el prefijo "Signal N: " si existe
    const title = rawTitle.replace(/^Signal\s+\d+:\s*/i, '')
    const body = trimmed.slice(firstNewline).trim()
    signals.push({ title, body })
  }

  // Asociar con el artículo correspondiente por índice
  return signals.slice(0, 3).map((s, i) => ({
    ...s,
    article: data.articles?.[i],
  }))
}

function extractSection(briefText: string, marker: string, nextMarker: string): string {
  const start = briefText.indexOf(marker)
  if (start === -1) return ''
  const end = nextMarker ? briefText.indexOf(nextMarker, start + marker.length) : -1
  const raw = end === -1 ? briefText.slice(start) : briefText.slice(start, end)
  const firstNewline = raw.indexOf('\n')
  return firstNewline === -1 ? '' : raw.slice(firstNewline).trim()
}

function editionLabel(lastUpdated: string): string | null {
  const day = new Date(lastUpdated).getDay()
  if (day === 2 || day === 5) return null
  return process.env.NODE_ENV === 'production' ? 'Edición Especial' : 'Edición de Prueba'
}

export default function Home() {
  const briefText = data.briefText ?? ''
  const hasNews = data.articles?.length > 0 || briefText.length > 0

  const formattedDate = data.lastUpdated
    ? new Date(data.lastUpdated).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const label = data.lastUpdated ? editionLabel(data.lastUpdated) : null
  const signals = extractIndividualSignals(briefText)
  const latamText   = extractSection(briefText, '## 3.', '## 4.')
  const quantumText = extractSection(briefText, '## 4.', '## 5.')
  const firmasText  = extractSection(briefText, '## 5.', '## 6.')
  const oportunText = extractSection(briefText, '## 6.', '## 7.')
  const sourcesText = extractSection(briefText, '## 7.', '')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F0EBE3' }}>
      <Header />

      {/* HERO */}
      <section style={{ backgroundColor: '#0D2645', padding: '56px 0 64px' }}>
        <div style={{ padding: '0 48px' }}>
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
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#C17F3E', marginTop: '10px', fontWeight: 300 }}>
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

      {hasNews && (() => {
        const navLinks = [
          { label: 'Apertura', anchor: '#apertura', show: !!data.morningBrief },
          { label: 'Señales', anchor: '#senales', show: signals.length > 0 },
          { label: 'LatAm Radar', anchor: '#latam', show: !!latamText },
          { label: 'Quantum & Daños', anchor: '#quantum', show: !!quantumText },
          { label: 'Firmas e Instituciones', anchor: '#firmas', show: !!firmasText },
          { label: 'Oportunidad', anchor: '#oportunidad', show: !!oportunText },
          { label: 'Fuentes', anchor: '#fuentes', show: !!sourcesText },
        ].filter(l => l.show)
        return (
          <nav style={{ backgroundColor: '#0A1E38', borderBottom: '1px solid #162D4A', position: 'sticky', top: 0, zIndex: 50, overflowX: 'auto' }}>
            <div style={{ display: 'flex', padding: '0 48px', minWidth: 'max-content' }}>
              {navLinks.map(({ label, anchor }) => (
                <a key={anchor} href={anchor} style={{
                  display: 'inline-block', padding: '11px 18px',
                  color: '#6B88A8', fontFamily: "'Inter', sans-serif",
                  fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                  textDecoration: 'none', borderBottom: '2px solid transparent',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </a>
              ))}
            </div>
          </nav>
        )
      })()}

      {hasNews ? (
        <>
          {/* MORNING BRIEF */}
          {data.morningBrief && (
            <section id="apertura" style={{ backgroundColor: '#FFFFFF' }}>
              <div style={{ padding: '52px 48px' }}>
                <SectionLabel>Apertura</SectionLabel>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(0.94rem, 1.3vw, 1.04rem)',
                  color: '#2A2A2A', lineHeight: 1.85, maxWidth: '820px',
                  margin: 0, fontWeight: 300,
                }}>
                  {data.morningBrief}
                </p>
              </div>
            </section>
          )}

          {/* SEÑALES PRINCIPALES — artículos completos */}
          {signals.length > 0 && (
            <section id="senales" style={{ backgroundColor: '#F0EBE3', padding: '52px 0 60px' }}>
              <div style={{ padding: '0 48px' }}>
                <SectionLabel>Señales Principales</SectionLabel>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                  {signals.map((signal, i) => {
                    const art = signal.article
                    const catStyle = art ? (CATEGORY_STYLES[art.category] ?? { bg: '#2A3A4A', color: '#FFF' }) : { bg: '#2A3A4A', color: '#FFF' }
                    return (
                      <article key={i} style={{
                        backgroundColor: '#FFFFFF',
                        borderTop: '2px solid #C17F3E',
                        boxShadow: '0 1px 6px rgba(13,38,69,0.06)',
                      }}>
                        {/* Cabecera del artículo */}
                        <div style={{ padding: '28px 36px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <span style={{
                              fontFamily: "'Inter', sans-serif", fontSize: '0.6rem',
                              letterSpacing: '0.2em', color: '#C17F3E', textTransform: 'uppercase', fontWeight: 700,
                            }}>
                              Señal {i + 1}
                            </span>
                            {art && (
                              <span style={{
                                backgroundColor: catStyle.bg, color: catStyle.color,
                                fontSize: '0.58rem', letterSpacing: '1.5px',
                                textTransform: 'uppercase', padding: '3px 8px',
                                fontFamily: "'Inter', sans-serif", fontWeight: 600,
                              }}>
                                {art.category}
                              </span>
                            )}
                          </div>
                          <h2 style={{
                            fontFamily: "'Inter', sans-serif", fontWeight: 500,
                            fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#0D2645',
                            lineHeight: 1.4, margin: '0 0 20px',
                          }}>
                            {signal.title}
                          </h2>
                        </div>

                        {/* Cuerpo completo del análisis */}
                        <div style={{ padding: '0 36px 28px' }}>
                          {renderParagraphs(signal.body, true)}
                          {art?.whyItMatters && (
                            <p style={{
                              fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#3A3A3A',
                              lineHeight: '1.82', margin: '0 0 14px',
                            }}>
                              {art.whyItMatters}
                            </p>
                          )}
                        </div>

                        {/* Pie: fuente para referencia */}
                        {art && (
                          <div style={{
                            borderTop: '1px solid #EAE3DA', padding: '14px 36px',
                            display: 'flex', alignItems: 'center', gap: '16px',
                            backgroundColor: '#FAFAF8',
                          }}>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#9A8E84' }}>
                              {art.source}
                            </span>
                            <span style={{ color: '#DDD' }}>·</span>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#B0A898' }}>
                              {(() => {
                                try { return new Date(art.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) }
                                catch { return art.publishedAt }
                              })()}
                            </span>
                            <a href={art.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                              marginLeft: 'auto', fontFamily: "'Inter', sans-serif", fontSize: '0.6rem',
                              color: '#FFFFFF', letterSpacing: '0.1em', textDecoration: 'none',
                              textTransform: 'uppercase', backgroundColor: '#0D2645',
                              padding: '6px 14px', display: 'inline-block',
                            }}>
                              Ver fuente ↗
                            </a>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* LATAM RADAR */}
          {latamText && (
            <section id="latam" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E8E0D5' }}>
              <div style={{ padding: '52px 48px' }}>
                <SectionLabel>LatAm Radar</SectionLabel>
                <div style={{ maxWidth: '900px' }}>{renderParagraphs(latamText)}</div>
              </div>
            </section>
          )}

          {/* QUANTUM & DAÑOS */}
          {quantumText && (
            <section id="quantum" style={{ backgroundColor: '#F7F4F0', borderTop: '1px solid #E8E0D5' }}>
              <div style={{ padding: '52px 48px' }}>
                <SectionLabel>Quantum & Daños</SectionLabel>
                <div style={{ maxWidth: '900px' }}>{renderParagraphs(quantumText)}</div>
              </div>
            </section>
          )}

          {/* FIRMAS E INSTITUCIONES */}
          {firmasText && (
            <section id="firmas" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E8E0D5' }}>
              <div style={{ padding: '52px 48px' }}>
                <SectionLabel>Firmas e Instituciones</SectionLabel>
                <div style={{ maxWidth: '900px' }}>{renderParagraphs(firmasText)}</div>
              </div>
            </section>
          )}

          {/* OPORTUNIDAD DE CONTENIDO */}
          {oportunText && (
            <section id="oportunidad" style={{ backgroundColor: '#F7F4F0', borderTop: '1px solid #E8E0D5' }}>
              <div style={{ padding: '52px 48px' }}>
                <SectionLabel>Oportunidad de Contenido</SectionLabel>
                <div style={{ maxWidth: '900px' }}>{renderParagraphs(oportunText)}</div>
              </div>
            </section>
          )}

          {/* FUENTES */}
          {sourcesText && (
            <section id="fuentes" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E8E0D5' }}>
              <div style={{ padding: '40px 48px 52px' }}>
                <SectionLabel>Fuentes</SectionLabel>
                <div style={{ maxWidth: '900px' }}>{renderParagraphs(sourcesText)}</div>
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
