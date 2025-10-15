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
        <span className="logo">[ LAB7-PROOF :: OAA ]</span>
        {oaaLearning && (
          <span className="ticker" aria-live="polite" aria-label="OAA is learning">
            ▸ Learning… ▸ Learning… ▸
          </span>
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
          font-family: "Trebuchet MS", Verdana, Arial, sans-serif;
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 12px; border: 1px solid #c7d0e1; background: #eef3ff;
          box-shadow: inset 0 1px 0 #fff; position: sticky; top: 0; z-index: 1000;
        }
        .brand { display: flex; align-items: baseline; gap: 10px; }
        .logo { font-weight: 700; color: #1e3a8a; letter-spacing: .5px; }
        .ticker { font-size: 12px; color: #334155; white-space: nowrap; animation: marquee 8s linear infinite; }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .links { display: flex; gap: 14px; list-style: none; margin: 0; padding: 0; }
        .links a { text-decoration: none; color: #0f172a; padding: 4px 8px; border-radius: 4px; }
        .links li.active a, .links a:hover { background: #dbeafe; color: #111827; }

        .status { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #334155; }
        .status span { display: inline-flex; align-items: center; gap: 6px; }
        .status em { font-style: normal; color: #0f172a; }

        .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 1px #00000010; }
        .dot.up { background: #16a34a; animation: pulseUp 1.6s ease-in-out infinite; }
        .dot.degraded { background: #f59e0b; animation: pulseDegraded 1.6s ease-in-out infinite; }
        .dot.down { background: #dc2626; animation: pulseDown 1.6s ease-in-out infinite; }
        .dot.unknown { background: #94a3b8; }

        @keyframes pulseUp { 0%,100%{ box-shadow:0 0 0 0 rgba(22,163,74,.6)} 50%{ box-shadow:0 0 0 6px rgba(22,163,74,0)} }
        @keyframes pulseDegraded { 0%,100%{ box-shadow:0 0 0 0 rgba(245,158,11,.6)} 50%{ box-shadow:0 0 0 6px rgba(245,158,11,0)} }
        @keyframes pulseDown { 0%,100%{ box-shadow:0 0 0 0 rgba(220,38,38,.6)} 50%{ box-shadow:0 0 0 6px rgba(220,38,38,0)} }
      `}</style>
    </nav>
  );
}