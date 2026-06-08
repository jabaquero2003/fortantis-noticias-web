import Image from 'next/image'

export default function Header() {
  return (
    <header style={{ backgroundColor: '#0D2645' }}>
      <div style={{ padding: '22px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box' }}>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/logo-fortantis.png"
            alt="Fortantis"
            width={180}
            height={48}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <div style={{ color: '#6B88A8', fontSize: '0.68rem', letterSpacing: '0.12em', textAlign: 'right', textTransform: 'uppercase' }}>
          <div>Boletín de Noticias</div>
          <div style={{ color: '#C17F3E', marginTop: '3px' }}>Martes &amp; Viernes · 8:30 AM</div>
        </div>

      </div>
    </header>
  )
}
