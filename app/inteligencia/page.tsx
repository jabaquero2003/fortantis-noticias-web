import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import newsData from '@/data/news.json'

export const revalidate = 0

interface BoutiquePublication {
  id?: string
  title: string
  firm: string
  author?: string
  date: string
  sourceType: string
  jurisdiction?: string
  summary: string
  link: string
}

interface ArbitrationEvent {
  id?: string
  name: string
  organizer: string
  date: string
  location: string
  region: string
  link: string
}

interface NewsData {
  lastUpdated: string
  edition: number
  boutiques?: BoutiquePublication[]
  events?: ArbitrationEvent[]
}

const data = newsData as NewsData

const SOURCE_TYPE_LABELS: Record<string, string> = {
  'article': 'Artículo',
  'client alert': 'Client Alert',
  'legal update': 'Actualización Legal',
  'newsletter': 'Newsletter',
  'case note': 'Case Note',
  'report': 'Informe',
  'LinkedIn post': 'LinkedIn',
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

export default function InteligenciaPage() {
  const boutiques = data.boutiques ?? []
  const events = data.events ?? []

  const formattedDate = data.lastUpdated
    ? new Date(data.lastUpdated).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F0EBE3' }}>
      <Header />

      {/* HERO */}
      <section style={{ backgroundColor: '#0D2645', padding: '52px 0 60px' }}>
        <div style={{ padding: '0 48px' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#6B88A8', fontFamily: "'Inter', sans-serif",
            fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            textDecoration: 'none', marginBottom: '20px',
          }}>
            ← Noticias Principales
          </Link>
          <h1 style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 200,
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#FFFFFF',
            letterSpacing: '0.04em', lineHeight: 1.2, margin: 0,
          }}>
            Inteligencia Competitiva
          </h1>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#C17F3E', marginTop: '8px', fontWeight: 300 }}>
            ¿Qué dicen las boutiques de arbitraje? · Eventos del sector
          </div>
          {formattedDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
              <div style={{ width: '20px', height: '1px', backgroundColor: '#C17F3E' }} />
              <span style={{ color: '#4A6A8A', fontSize: '0.7rem', letterSpacing: '0.06em', fontFamily: "'Inter', sans-serif" }}>
                Edición #{data.edition} · {formattedDate}
              </span>
            </div>
          )}
        </div>
      </section>

      <div style={{ height: '3px', backgroundColor: '#C17F3E' }} />

      {/* NAV */}
      <nav style={{ backgroundColor: '#0A1E38', borderBottom: '1px solid #162D4A', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', padding: '0 48px', alignItems: 'center' }}>
          <a href="#boutiques" style={{ display: 'inline-block', padding: '11px 18px', color: '#6B88A8', fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Boutiques
          </a>
          <a href="#eventos" style={{ display: 'inline-block', padding: '11px 18px', color: '#6B88A8', fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Eventos
          </a>
          <div style={{ marginLeft: 'auto', padding: '6px 0' }}>
            <Link href="/" style={{
              display: 'inline-block', padding: '7px 16px',
              border: '1px solid #2A4A6A', color: '#6B88A8',
              fontFamily: "'Inter', sans-serif", fontSize: '0.58rem',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              ← Noticias
            </Link>
          </div>
        </div>
      </nav>

      {/* BOUTIQUES */}
      <section id="boutiques" style={{ backgroundColor: '#FFFFFF', padding: '52px 0 60px' }}>
        <div style={{ padding: '0 48px' }}>
          <SectionLabel>¿Qué dicen las Boutiques de Arbitraje?</SectionLabel>

          {boutiques.length === 0 ? (
            <div style={{ padding: '40px 0', borderTop: '1px solid #E8E0D5' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#9A8E84', fontStyle: 'italic' }}>
                Sin publicaciones relevantes de firmas identificadas en esta edición.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {boutiques.map((pub, i) => (
                <article key={pub.id ?? i} style={{
                  backgroundColor: '#FAFAF8',
                  borderLeft: '3px solid #C17F3E',
                  padding: '28px 32px',
                  borderBottom: '1px solid #EAE3DA',
                }}>
                  {/* Firma y metadatos */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
                        fontWeight: 700, color: '#C17F3E', letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}>
                        {pub.firm}
                      </span>
                      <span style={{
                        backgroundColor: '#0D2645', color: '#FFFFFF',
                        fontSize: '0.55rem', letterSpacing: '1.5px',
                        textTransform: 'uppercase', padding: '2px 7px',
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {SOURCE_TYPE_LABELS[pub.sourceType] ?? pub.sourceType}
                      </span>
                      {pub.jurisdiction && (
                        <span style={{
                          color: '#9A8E84', fontSize: '0.65rem',
                          fontFamily: "'Inter', sans-serif",
                        }}>
                          {pub.jurisdiction}
                        </span>
                      )}
                    </div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: '#B0A898', whiteSpace: 'nowrap' }}>
                      {(() => {
                        try { return new Date(pub.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) }
                        catch { return pub.date }
                      })()}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 style={{
                    fontFamily: "'Inter', sans-serif", fontWeight: 500,
                    fontSize: '1rem', color: '#0D2645', lineHeight: 1.4,
                    margin: '0 0 6px',
                  }}>
                    {pub.title}
                  </h3>

                  {/* Autor */}
                  {pub.author && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#6B88A8', marginBottom: '14px' }}>
                      {pub.author}
                    </div>
                  )}

                  {/* Resumen */}
                  <p style={{
                    fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#3A3A3A',
                    lineHeight: '1.78', margin: '0 0 16px',
                  }}>
                    {pub.summary}
                  </p>

                  {/* Link */}
                  <a href={pub.link} target="_blank" rel="noopener noreferrer" style={{
                    fontFamily: "'Inter', sans-serif", fontSize: '0.6rem',
                    color: '#C17F3E', letterSpacing: '0.1em', textTransform: 'uppercase',
                    textDecoration: 'none', borderBottom: '1px solid rgba(193,127,62,0.4)',
                  }}>
                    Ver publicación →
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* EVENTOS */}
      <section id="eventos" style={{ backgroundColor: '#F7F4F0', borderTop: '1px solid #E8E0D5', padding: '48px 0 56px' }}>
        <div style={{ padding: '0 48px' }}>
          <SectionLabel>Eventos de Arbitraje</SectionLabel>

          {events.length === 0 ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#9A8E84', fontStyle: 'italic' }}>
              Sin eventos de arbitraje identificados en esta edición.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {events.map((ev, i) => (
                <div key={ev.id ?? i} style={{
                  backgroundColor: '#FFFFFF', padding: '24px 28px',
                  borderTop: '2px solid #0D2645',
                  boxShadow: '0 1px 4px rgba(13,38,69,0.06)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                    <span style={{
                      backgroundColor: '#F0EBE3', color: '#6B88A8',
                      fontSize: '0.55rem', letterSpacing: '1.5px',
                      textTransform: 'uppercase', padding: '2px 7px',
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {ev.region}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: '#B0A898' }}>
                      {ev.date}
                    </span>
                  </div>
                  <h4 style={{
                    fontFamily: "'Inter', sans-serif", fontWeight: 500,
                    fontSize: '0.95rem', color: '#0D2645', lineHeight: 1.4,
                    margin: '0 0 6px',
                  }}>
                    {ev.name}
                  </h4>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#6B88A8', marginBottom: '4px' }}>
                    {ev.organizer}
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#9A8E84', marginBottom: '16px' }}>
                    {ev.location}
                  </div>
                  <a href={ev.link} target="_blank" rel="noopener noreferrer" style={{
                    fontFamily: "'Inter', sans-serif", fontSize: '0.6rem',
                    color: '#C17F3E', letterSpacing: '0.1em', textTransform: 'uppercase',
                    textDecoration: 'none', borderBottom: '1px solid rgba(193,127,62,0.4)',
                  }}>
                    Más información →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
