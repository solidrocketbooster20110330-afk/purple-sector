"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈", match: (path: string) => path === "/" },
  { href: "/schedule", label: "일정", match: (path: string) => path.startsWith("/schedule") },
  { href: "/results", label: "결과", match: (path: string) => path.startsWith("/results") },
  { href: "/championship", label: "순위", match: (path: string) => path.startsWith("/championship") },
  { href: "/search?type=drivers", label: "드라이버", match: (path: string) => path.startsWith("/drivers") || path === "/search" },
  { href: "/search?type=teams", label: "팀", match: (path: string) => path.startsWith("/teams") },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "relative",
        zIndex: 100,
        background: "#08080a",
        borderBottom: "1px solid #30233f",
        color: "#fff",
      }}
    >
      <div
        style={{
          minHeight: "58px",
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          boxSizing: "border-box",
          borderBottom: "1px solid #211b29",
        }}
      >
        <Link
          href="/"
          aria-label="Purple Sector 홈"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: "clamp(19px, 5vw, 24px)",
            fontWeight: 900,
            letterSpacing: "-0.8px",
            whiteSpace: "nowrap",
          }}
        >
          PURPLE <span style={{ color: "#a78bfa" }}>SECTOR</span>
        </Link>
      </div>

      <nav
        aria-label="메인 내비게이션"
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: "clamp(18px, 5vw, 28px)",
          minHeight: "48px",
          padding: "0 18px",
          overflowX: "auto",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {navItems.map((item) => {
          const active = item.match(pathname);

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                position: "relative",
                minHeight: "48px",
                color: active ? "#a78bfa" : "#e5e1ea",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: active ? 800 : 600,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {item.label}
              {active && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "3px",
                    borderRadius: "3px 3px 0 0",
                    background: "#7c3aed",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
