import "./styles.css";
import Link from "next/link";
import type { ReactNode } from "react";
import Logout from "@/components/Logout";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <nav className="nav-inner">
            <div className="brand">✨ Reflections</div>
            <div className="links">
              <Link href="/">Home</Link>
              <Link href="/onboarding">Onboarding</Link>
              <Link href="/login">Login</Link>
              <Link href="/companion">Companion</Link>
            </div>
            <Logout />
          </nav>
        </header>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
