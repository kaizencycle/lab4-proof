"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SidebarStatus from "@/components/SidebarStatus";

const links = [
  { href: "/feed", label: "Feed", icon: "📰", description: "Community reflections" },
  { href: "/onboarding", label: "Onboarding", icon: "🧭", description: "Get started" },
  { href: "/login", label: "Login", icon: "🔐", description: "Sign in" },
  { href: "/companion", label: "Companion", icon: "🤝", description: "AI assistant" },
  { href: "/forest", label: "Forest", icon: "🌳", description: "Growth tracking" },
  { href: "/programs", label: "Programs", icon: "✨", description: "Learning paths" },
  { href: "/consensus", label: "Consensus", icon: "🗳️", description: "Community decisions" },
];

export default function AppSidebar() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(true);

  // remember state
  useEffect(() => {
    const s = localStorage.getItem("sidebar-open");
    if (s !== null) setOpen(s === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebar-open", open ? "1" : "0");
  }, [open]);

  // keyboard: S toggles
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "s" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault(); setOpen(o=>!o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      <button className="sb-toggle" aria-label="Toggle sidebar" onClick={() => setOpen(o=>!o)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <aside className={`sb ${open ? "open" : ""}`}>
        <div className="sb-head">
          <div className="logo-container">
            <span className="logo">💎</span>
          </div>
          <div className="brand-text">
            <strong style={{color: 'var(--facebook-gold)', textShadow: '0 0 10px rgba(255,215,0,0.3)'}}>Reflections</strong>
            <span className="brand-subtitle" style={{color: 'var(--facebook-gold)', opacity: 0.8}}>AI Companion</span>
          </div>
        </div>
        <nav className="sb-nav">
          {links.map(l => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className={`sb-link ${active ? "active" : ""}`} title={l.description}>
                <span className="ic">{l.icon}</span>
                <div className="link-content">
                  <span className="link-label">{l.label}</span>
                  <span className="link-description">{l.description}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <SidebarStatus />
        <div className="sb-foot"><small>Press <kbd>S</kbd> to toggle</small></div>
      </aside>
    </>
  );
}
