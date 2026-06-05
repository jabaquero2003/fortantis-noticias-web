export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0D2645' }}>
      <div style={{ height: '1px', backgroundColor: '#1E3A5F' }} />
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">

          <div>
            <div
              style={{
                color: '#C17F3E',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
                fontSize: '1rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
              }}
            >
              FORTANTIS
            </div>
            <div
              style={{
                color: '#6B88A8',
                fontSize: '0.68rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: '6px',
              }}
            >
              Latam Native. Globally Minded.
            </div>
          </div>

          <div style={{ color: '#6B88A8', fontSize: '0.75rem', lineHeight: '1.8' }} className="text-left sm:text-right">
            <div>Paseo de los Tamarindos 90, Torre 2</div>
            <div>Bosques de las Lomas · Ciudad de México</div>
            <div style={{ marginTop: '6px' }}>
              <a href="https://fortantis.com" style={{ color: '#C17F3E' }}>fortantis.com</a>
              <span style={{ color: '#3A5470', margin: '0 8px' }}>·</span>
              <span>(+52) 55 4515 3552</span>
            </div>
          </div>

        </div>

        <div style={{ borderTop: '1px solid #1A3050', marginTop: '28px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ color: '#3A5470', fontSize: '0.65rem', letterSpacing: '0.08em', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
            Claridad rigurosa. Análisis que se sostiene.
          </span>
          <span style={{ color: '#3A5470', fontSize: '0.65rem' }}>
            © {new Date().getFullYear()} Fortantis · Boletín automatizado
          </span>
        </div>
      </div>
    </footer>
  )
}
