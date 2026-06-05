import Image from 'next/image'

export default function Header() {
  return (
    <header style={{ backgroundColor: '#0D2645' }}>
      <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">

        <div className="flex items-center gap-4">
          <Image
            src="/logo-fortantis.png"
            alt="Fortantis"
            width={180}
            height={48}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <div
          style={{ color: '#6B88A8', fontSize: '0.68rem', letterSpacing: '0.12em', textAlign: 'right' }}
          className="hidden sm:block uppercase"
        >
          <div>Boletín de Noticias</div>
          <div style={{ color: '#C17F3E', marginTop: '3px' }}>Martes & Viernes · 8:30 AM</div>
        </div>

      </div>
    </header>
  )
}
