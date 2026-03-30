import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FindIt — Foro de Objetos Perdidos',
  description: 'Encuentra o reporta objetos perdidos en tu organización',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}