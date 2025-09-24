import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LogForm from '@/components/LogForm' 

// Use RELATIVE imports so we don't depend on tsconfig path aliases
import DemoBadge from '../components/DemoBadge';
import StatusBar from '../components/StatusBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reflections — Agora',
  description: 'Log your daily reflections and earn GIC.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* optional simple nav — remove if you don’t want it */}
        <nav style={{ display: 'flex', gap: 12, padding: 12 }}>
          <a href="/">Home</a>
          <a href="/onboarding">Onboarding</a>
          <a href="/login">Login</a>
          <a href="/companion">Companion</a>
        </nav>

        {/* client-side helpers */}
        <DemoBadge />
        <StatusBar />

        {children}
      </body>
    </html>
  );
}
