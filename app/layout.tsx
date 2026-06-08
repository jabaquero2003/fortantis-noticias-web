import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Noticiero Fortantis · Arbitraje Internacional',
  description: 'Boletín de noticias de arbitraje internacional de Fortantis. Actualizado cada martes y viernes con las noticias más relevantes a nivel global.',
  keywords: 'arbitraje internacional, arbitration, ICSID, ICC, UNCITRAL, Fortantis, noticias arbitraje',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Fortantis · Noticias de Arbitraje Internacional',
    description: 'Las noticias más relevantes de arbitraje internacional, curadas y resumidas por Fortantis.',
    url: 'https://noticias.fortantis.com',
    siteName: 'Fortantis Noticias',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
