import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reflections — GIC Rewards',
  description: 'Log your thoughts; earn GIC; seal your day.',
}

import DemoBadge from '../components/DemoBadge'; // ⬅️ add this import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DemoBadge />   {/* ⬅️ add this line */}
        {children}
      </body>
    </html>
  );
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
