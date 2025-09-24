import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DemoBadge from '../components/DemoBadge'; // ⬅️ add this import
import StatusBar from '@/components/StatusBar'; // add this

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reflections — GIC Rewards',
  description: 'Log your thoughts; earn GIC; seal your day.',}

export default function RootLayout({ children }: { children: React.ReactNode }) 
{
  return (
    <html lang="en">
      <body>
        <DemoBadge />   {/* ⬅️ add this line */}
        {children}
      </body>
    </html>
  );
}
export default function RootLayout({ children }: { children: React.ReactNode }) 
{
  return (
    <html lang="en">
      <body className={inter.className}>
        <DemoBadge />
        
        <nav style={{ display: 'flex', gap: 12, padding: 12 }}>
  <a href="/">Home</a>
  <a href="/onboarding">Onboarding</a>
  <a href="/login">Login</a>
  <a href="/companion">Companion</a>
</nav>
        
        <StatusBar />   {/* add this line */}
        {children}
      </body>
    </html>
  );
}
export default function RootLayout({ children }: { children: React.ReactNode }) 
{children, children: React.ReactNode} 
{return (<html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
