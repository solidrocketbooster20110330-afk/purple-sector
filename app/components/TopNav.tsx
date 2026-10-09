"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  { href: "/schedule", label: "Schedule", match: (path: string) => path.startsWith("/schedule") },
  { href: "/results", label: "Results", match: (path: string) => path.startsWith("/results") },
  { href: "/championship", label: "Standings", match: (path: string) => path.startsWith("/championship") },
  { href: "/drivers", label: "Drivers", match: (path: string) => path.startsWith("/drivers") || /^\/championship\/[^/]+$/.test(path) },
  { href: "/teams", label: "Teams", match: (path: string) => path.startsWith("/teams") || path.startsWith("/championship/constructors") },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header style={{ position: "relative", zIndex: 100, background: "#08080a", borderBottom: "1px solid #30233f", color: "#fff" }}>
      <div style={{ minHeight: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "0 18px", boxSizing: "border-box", borderBottom: "1px solid #211b29" }}>
        <Link href="/" aria-label="Purple Sector 홈" style={{ color: "#fff", textDecoration: "none", fontSize: "clamp(19px, 5vw, 24px)", fontWeight: 900, letterSpacing: "-0.8px", whiteSpace: "nowrap" }}>
          PURPLE <span style={{ color: "#a78bfa" }}>SECTOR</span>
        </Link>
        <Link href="/search" aria-label="검색" title="검색" style={{ width: "40px", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", border: "1px solid #3a2b4d", borderRadius: "12px", background: "#15111c", textDecoration: "none", flexShrink: 0 }}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
        </Link>
      </div>

      <nav aria-label="메인 내비게이션" style={{ display: "flex", alignItems: "stretch", gap: "clamp(14px, 3.8vw, 22px)", minHeight: "48px", padding: "0 12px", overflowX: "auto", overflowY: "hidden", whiteSpace: "nowrap", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {navItems.map((item) => {
          const active = item.match(pathname);
          return (
            <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", minHeight: "48px", color: active ? "#a78bfa" : "#e5e1ea", textDecoration: "none", fontSize: "14px", fontWeight: active ? 800 : 600, WebkitTapHighlightColor: "transparent" }}>
              {item.label}
              {active && <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "3px", borderRadius: "3px 3px 0 0", background: "#7c3aed" }} />}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
