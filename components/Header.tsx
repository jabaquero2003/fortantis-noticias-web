export default function Header() {
  return (
    <header style={{ backgroundColor: '#0D2645' }} className="w-full py-6 px-8 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="44" y="15" width="4" height="70" fill="#C17F3E"/>
            <rect x="34" y="25" width="4" height="60" fill="#C17F3E"/>
            <rect x="24" y="35" width="4" height="50" fill="#C17F3E"/>
            <rect x="54" y="25" width="4" height="60" fill="#C17F3E"/>
            <rect x="64" y="35" width="4" height="50" fill="#C17F3E"/>
            <line x1="20" y1="85" x2="72" y2="85" stroke="#C17F3E" strokeWidth="3"/>
          </svg>
          <div>
            <span
              style={{ color: '#C17F3E', letterSpacing: '0.25em', fontSize: '1.5rem', fontWeight: 300 }}
              className="font-sans uppercase tracking-widest"
            >
              FORTANTIS
            </span>
            <p style={{ color: '#8BA0BB', fontSize: '0.7rem', letterSpacing: '0.15em' }} className="uppercase mt-0.5">
              Inteligencia en Arbitraje Internacional
            </p>
          </div>
        </div>
        <div style={{ color: '#8BA0BB', fontSize: '0.75rem', letterSpacing: '0.1em' }} className="text-right hidden sm:block">
          <p className="uppercase">Boletín de Noticias</p>
          <p>Martes & Viernes · 8:30 AM</p>
        </div>
      </div>
    </header>
  )
}
