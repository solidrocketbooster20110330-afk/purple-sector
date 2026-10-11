"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import SearchModal from "./SearchModal";

const navItems = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  { href: "/news", label: "News", match: (path: string) => path.startsWith("/news") },
  { href: "/schedule", label: "Schedule", match: (path: string) => path.startsWith("/schedule") },
  { href: "/results", label: "Results", match: (path: string) => path.startsWith("/results") },
  { href: "/championship", label: "Standings", match: (path: string) => path === "/championship" },
  { href: "/drivers", label: "Drivers", match: (path: string) => path.startsWith("/drivers") || (/^\/championship\/[^/]+$/.test(path) && !path.startsWith("/championship/constructors")) },
  { href: "/teams", label: "Teams", match: (path: string) => path.startsWith("/teams") || path.startsWith("/championship/constructors") },
];

export default function TopNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      <header style={{ position: "relative", zIndex: 100, background: "#08080a", borderBottom: "1px solid #30233f", color: "#fff" }}>
        <div style={{ minHeight: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "0 18px", boxSizing: "border-box", borderBottom: "1px solid #211b29" }}>
          <Link href="/" aria-label="Purple Sector 홈" style={{ color: "#fff", textDecoration: "none", fontSize: "clamp(19px, 5vw, 24px)", fontWeight: 900, letterSpacing: "-0.8px", whiteSpace: "nowrap" }}>
            PURPLE <span style={{ color: "#a78bfa" }}>SECTOR</span>
          </Link>
          <button type="button" onClick={() => setSearchOpen(true)} aria-label="검색" title="검색" style={{ width: "40px", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", border: "1px solid #3a2b4d", borderRadius: "12px", background: "#15111c", cursor: "pointer", flexShrink: 0 }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>
        </div>
        <nav aria-label="메인 내비게이션" style={{ display: "flex", alignItems: "stretch", gap: "clamp(4px, 1.15vw, 10px)", minHeight: "44px", padding: "0 clamp(6px, 1.8vw, 14px)", overflowX: "auto", overflowY: "hidden", whiteSpace: "nowrap", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", width: "100%", boxSizing: "border-box" }}>
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", minHeight: "44px", color: active ? "#a78bfa" : "#e5e1ea", textDecoration: "none", fontSize: "clamp(10px, 2.9vw, 13px)", fontWeight: active ? 800 : 600, letterSpacing: "-0.2px", WebkitTapHighlightColor: "transparent" }}>
                {item.label}
                {active && <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "3px", borderRadius: "3px 3px 0 0", background: "#7c3aed" }} />}
              </Link>
            );
          })}
        </nav>
      </header>
      {searchOpen && <SearchModal onClose={closeSearch} />}
    </>
  );
}
