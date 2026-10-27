"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SearchModal from "./SearchModal";

const navItems = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  { href: "/news", label: "News", match: (path: string) => path.startsWith("/news") },
  { href: "/schedule", label: "Schedule", match: (path: string) => path.startsWith("/schedule") },
  { href: "/results", label: "Results", match: (path: string) => path.startsWith("/results") },
  { href: "/championship", label: "Standings", match: (path: string) => path === "/championship" },
  { href: "/drivers", label: "Drivers", match: (path: string) => path.startsWith("/drivers") || (/^\/championship\/[^/]+$/.test(path) && !path.startsWith("/championship/constructors")) },
  { href: "/teams", label: "Constructors", match: (path: string) => path.startsWith("/teams") || path.startsWith("/championship/constructors") },
  { href: "/championship/compare", label: "Compare", match: (path: string) => path.startsWith("/championship/compare") },
  { href: "/favorites", label: "Favorites", match: (path: string) => path.startsWith("/favorites") },
];

export default function TopNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "ko">("en");
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("purple-sector-language");
      if (saved === "ko" || saved === "en") setLanguage(saved);
    } catch {
      // Keep English as the default if storage is unavailable.
    }
  }, []);

  const changeLanguage = (nextLanguage: "en" | "ko") => {
    setLanguage(nextLanguage);
    try {
      window.localStorage.setItem("purple-sector-language", nextLanguage);
      window.dispatchEvent(new CustomEvent("purple-sector-language-change", { detail: nextLanguage }));
    } catch {
      // The current page still updates even if persistence is unavailable.
    }
  };

  const labels = language === "ko"
    ? { Home: "홈", News: "뉴스", Schedule: "일정", Results: "결과", Standings: "순위", Drivers: "드라이버", Constructors: "컨스트럭터", Compare: "비교", Favorites: "즐겨찾기" }
    : { Home: "Home", News: "News", Schedule: "Schedule", Results: "Results", Standings: "Standings", Drivers: "Drivers", Constructors: "Constructors" };

  return (
    <>
      <header style={{ position: "relative", zIndex: 100, background: "#08080a", borderBottom: "1px solid #30233f", color: "#fff" }}>
        <div style={{ minHeight: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "0 18px", boxSizing: "border-box", borderBottom: "1px solid #211b29" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <Link href="/" aria-label="Purple Sector home" style={{ color: "#fff", textDecoration: "none", fontSize: "clamp(19px, 5vw, 24px)", fontWeight: 900, letterSpacing: "-0.8px", whiteSpace: "nowrap", flexShrink: 0 }}>
              PURPLE <span style={{ color: "#a78bfa" }}>SECTOR</span>
            </Link>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
              <select
                aria-label="Language"
                value={language}
                onChange={(event) => changeLanguage(event.target.value as "en" | "ko")}
                style={{ appearance: "none", WebkitAppearance: "none", height: "34px", minWidth: "68px", padding: "0 27px 0 11px", color: "#e8e3ef", border: "1px solid #3a2b4d", borderRadius: "999px", background: "#15111c", fontSize: "12px", fontWeight: 800, letterSpacing: "0.3px", outline: "none", cursor: "pointer" }}
              >
                <option value="en">EN</option>
                <option value="ko">한국어</option>
              </select>
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: "10px", pointerEvents: "none" }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <button type="button" onClick={() => setSearchOpen(true)} aria-label={language === "ko" ? "검색" : "Search"} title={language === "ko" ? "검색" : "Search"} style={{ width: "40px", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", border: "1px solid #3a2b4d", borderRadius: "12px", background: "#15111c", cursor: "pointer", flexShrink: 0 }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            </button>
          </div>
        </div>
        <nav aria-label={language === "ko" ? "메인 내비게이션" : "Main navigation"} style={{ display: "flex", alignItems: "stretch", justifyContent: "space-between", gap: "clamp(2px, 0.8vw, 8px)", minHeight: "42px", padding: "0 8px", overflowX: "auto", overflowY: "hidden", whiteSpace: "nowrap", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", width: "100%", boxSizing: "border-box" }}>
          {navItems.map((item) => {
            const active = item.match(pathname);
            const isConstructorStandings = pathname.startsWith("/championship/constructors");
            const label = labels[item.label as keyof typeof labels];
            const href = item.label === "Constructors" && isConstructorStandings ? "/championship/constructors" : item.href;
            return (
              <Link key={item.label} href={href} aria-current={active ? "page" : undefined} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", minHeight: "42px", color: active ? "#a78bfa" : "#e5e1ea", textDecoration: "none", fontSize: "clamp(13px, 3.4vw, 15px)", fontWeight: active ? 800 : 600, letterSpacing: "-0.2px", WebkitTapHighlightColor: "transparent" }}>
                {label}
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
