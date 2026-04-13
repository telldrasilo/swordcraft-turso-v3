import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SwordCraft — Idle Forge (skin)',
  description: 'Заготовка UI для прототипов',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
