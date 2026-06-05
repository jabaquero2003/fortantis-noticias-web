export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0D2645' }} className="w-full mt-20 py-10 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span
              style={{ color: '#C17F3E', letterSpacing: '0.25em', fontSize: '1.1rem', fontWeight: 300 }}
              className="font-sans uppercase"
            >
              FORTANTIS
            </span>
            <p style={{ color: '#8BA0BB', fontSize: '0.75rem', marginTop: '4px' }}>
              Inteligencia en Arbitraje Internacional
            </p>
          </div>
          <div style={{ color: '#8BA0BB', fontSize: '0.75rem' }} className="text-center sm:text-right">
            <p>Boletín automatizado · Martes &amp; Viernes</p>
            <p className="mt-1">
              <a href="https://fortantis.com" style={{ color: '#C17F3E' }}>fortantis.com</a>
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1E3A5F', marginTop: '28px', paddingTop: '20px' }}>
          <p style={{ color: '#4A6480', fontSize: '0.7rem', textAlign: 'center', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} Fortantis · Uso exclusivo interno · Las noticias son obtenidas de fuentes públicas verificadas
          </p>
        </div>
      </div>
    </footer>
  )
}
