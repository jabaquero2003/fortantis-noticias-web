export default function Header() {
  return (
    <header style={{ backgroundColor: '#0D2645' }} className="w-full">
      <div className="max-w-6xl mx-auto px-8 py-7 flex items-center justify-between">

        {/* Logo + wordmark */}
        <div className="flex items-center gap-5">
          {/* Icon: vertical bars matching the Fortantis logo */}
          <svg width="36" height="44" viewBox="0 0 36 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="16" y="2"  width="4" height="46" rx="1" fill="#C17F3E"/>
            <rect x="9"  y="8"  width="4" height="40" rx="1" fill="#C17F3E"/>
            <rect x="2"  y="15" width="4" height="33" rx="1" fill="#C17F3E"/>
            <rect x="23" y="8"  width="4" height="40" rx="1" fill="#C17F3E"/>
            <rect x="30" y="15" width="4" height="33" rx="1" fill="#C17F3E"/>
          </svg>

          <div>
            <div
              style={{
                color: '#C17F3E',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
                fontSize: '1.35rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
              }}
            >
              FORTANTIS
            </div>
            <div
              style={{
                color: '#6B88A8',
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginTop: '3px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Servicios Periciales · Arbitraje Internacional
            </div>
          </div>
        </div>

        {/* Right label */}
        <div
          style={{ color: '#6B88A8', fontSize: '0.68rem', letterSpacing: '0.12em', textAlign: 'right' }}
          className="hidden sm:block uppercase"
        >
          <div>Boletín de Noticias</div>
          <div style={{ color: '#C17F3E', marginTop: '3px' }}>Martes & Viernes · 8:30 AM</div>
        </div>

      </div>

      {/* Copper bottom accent line */}
      <div style={{ height: '1px', backgroundColor: '#1E3A5F' }} />
    </header>
  )
}
