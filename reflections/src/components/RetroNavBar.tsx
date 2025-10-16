import Link from "next/link";
import { useMemo } from "react";

type LabKey = "lab7" | "lab4" | "lab6" | "ledger" | "gic";
type Status = "up" | "down" | "degraded" | "unknown";

export interface RetroNavBarProps {
  activePath?: string;
  oaaLearning?: boolean;
  labStatus?: Partial<Record<LabKey, Status>>;
}

const LABELS: Record<LabKey, string> = {
  lab7: "Lab7 OAA",
  lab4: "Lab4 FE",
  lab6: "Lab6 Shield",
  ledger: "Civic Ledger",
  gic: "GIC Index",
};

export default function RetroNavBar({
  activePath = "/",
  oaaLearning = false,
  labStatus = {},
}: RetroNavBarProps) {
  const items = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/oaa", label: "OAA" },
      { href: "/docs", label: "Docs" },
      { href: "/ops", label: "Ops" },
    ],
    []
  );

  const dot = (s?: Status) => {
    const cls =
      s === "up" ? "dot up" :
      s === "degraded" ? "dot degraded" :
      s === "down" ? "dot down" : "dot unknown";
    return <span className={cls} aria-hidden />;
  };

  return (
    <nav className="retro-nav" role="navigation" aria-label="Primary">
      <div className="brand">
        <div className="logo-container">
          <span className="logo">[ LAB7-PROOF :: OAA ]</span>
        </div>
        {oaaLearning && (
          <div className="learning-indicator" aria-live="polite" aria-label="OAA is learning">
            <div className="learning-dot"></div>
            <span>Learning…</span>
          </div>
        )}
      </div>

      <ul className="links">
        {items.map(it => (
          <li key={it.href} className={activePath === it.href ? "active" : ""}>
            <Link href={it.href}>{it.label}</Link>
          </li>
        ))}
      </ul>

      <div className="status">
        <span title={`${LABELS.lab7}`}>{dot(labStatus.lab7)}<em>OAA</em></span>
        <span title={`${LABELS.lab4}`}>{dot(labStatus.lab4)}<em>L4</em></span>
        <span title={`${LABELS.lab6}`}>{dot(labStatus.lab6)}<em>Shield</em></span>
        <span title={`${LABELS.ledger}`}>{dot(labStatus.ledger)}<em>Ledger</em></span>
        <span title={`${LABELS.gic}`}>{dot(labStatus.gic)}<em>GIC</em></span>
      </div>

      <style jsx>{`
        .retro-nav {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 24px; border: 1px solid var(--border); background: rgba(17,19,24,0.9);
          backdrop-filter: blur(12px); box-shadow: var(--shadow-lg); position: sticky; top: 0; z-index: 1000;
        }
        .brand { display: flex; align-items: center; gap: 16px; }
        .logo-container {
          background: var(--gradient);
          padding: 8px 16px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow);
        }
        .logo { font-weight: 700; color: white; letter-spacing: 0.5px; font-size: 0.875rem; }
        .learning-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--muted);
          background: var(--surface);
          padding: 6px 12px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
        .learning-dot {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.2)} }

        .links { display: flex; gap: 8px; list-style: none; margin: 0; padding: 0; }
        .links a { 
          text-decoration: none; 
          color: var(--muted); 
          padding: 8px 16px; 
          border-radius: var(--radius); 
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }
        .links li.active a, .links a:hover { 
          background: var(--primary); 
          color: white; 
          transform: translateY(-1px);
          box-shadow: var(--shadow);
        }

        .status { 
          display: flex; 
          align-items: center; 
          gap: 16px; 
          font-size: 0.75rem; 
          color: var(--muted);
          background: var(--surface);
          padding: 8px 16px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
        }
        .status span { display: inline-flex; align-items: center; gap: 8px; }
        .status em { font-style: normal; color: var(--text); font-weight: 500; }

        .dot { 
          width: 8px; 
          height: 8px; 
          border-radius: 50%; 
          display: inline-block; 
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }
        .dot.up { background: var(--success); animation: pulseUp 2s ease-in-out infinite; }
        .dot.degraded { background: var(--warning); animation: pulseDegraded 2s ease-in-out infinite; }
        .dot.down { background: var(--error); animation: pulseDown 2s ease-in-out infinite; }
        .dot.unknown { background: var(--muted); }

        @keyframes pulseUp { 0%,100%{ box-shadow:0 0 0 0 rgba(16,185,129,0.4)} 50%{ box-shadow:0 0 0 8px rgba(16,185,129,0)} }
        @keyframes pulseDegraded { 0%,100%{ box-shadow:0 0 0 0 rgba(245,158,11,0.4)} 50%{ box-shadow:0 0 0 8px rgba(245,158,11,0)} }
        @keyframes pulseDown { 0%,100%{ box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{ box-shadow:0 0 0 8px rgba(239,68,68,0)} }
      `}</style>
    </nav>
  );
}