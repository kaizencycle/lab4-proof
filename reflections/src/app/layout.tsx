import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reflections - GIC Rewards',
  description: 'Log your thoughts; earn GIC; seal your day.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

export const metadata = { title: 'Reflections', description: 'Daily XP' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#0b0b0b', color: '#eaeaea', fontFamily: 'system-ui, sans-serif' }}>
        <main style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
