"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const tabs = [
  { href: "/results", label: "🏁 Race" },
  { href: "/results/qualifying", label: "⚡ Qualifying" },
  { href: "/results/practice/1", label: "🛠 FP1" },
  { href: "/results/practice2/1", label: "🛠 FP2" },
  { href: "/results/practice3/1", label: "🛠 FP3" },
];

const baseStyle = {
  minWidth: "150px",
  flexShrink: 0,
  padding: "14px 18px",
  borderRadius: "16px",
  textAlign: "center" as const,
  textDecoration: "none",
  fontWeight: "bold",
  color: "white",
  border: "1px solid #2b347a",
};

export default function ResultsTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentRound =
    pathname.startsWith("/results/practice/") ||
    pathname.startsWith("/results/practice2/") ||
    pathname.startsWith("/results/practice3/")
      ? pathname.split("/").pop()
      : searchParams.get("round");

  const tabs = [
    { href: "/results", label: "🏁 Race" },
    { href: "/results/qualifying", label: "⚡ Qualifying" },
    { href: "/results/practice/1", label: "🛠 FP1" },
    { href: "/results/practice2/1", label: "🛠 FP2" },
    { href: "/results/practice3/1", label: "🛠 FP3" },
  ];

  const getHref = (href: string) => {
    if (!currentRound) return href;

    if (href === "/results") return `/results?round=${currentRound}`;
    if (href === "/results/qualifying") {
      return `/results/qualifying?round=${currentRound}`;
    }
    if (href === "/results/practice/1") {
      return `/results/practice/${currentRound}`;
    }
    if (href === "/results/practice2/1") {
      return `/results/practice2/${currentRound}`;
    }
    if (href === "/results/practice3/1") {
      return `/results/practice3/${currentRound}`;
    }

    return href;
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        overflowX: "auto",
        marginBottom: "20px",
        paddingBottom: "4px",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {tabs.map((tab) => {
        const href = getHref(tab.href);
        const active =
          pathname === "/results" && tab.href === "/results" ||
          pathname === "/results/qualifying" && tab.href === "/results/qualifying" ||
          pathname.startsWith("/results/practice/") && tab.href === "/results/practice/1" ||
          pathname.startsWith("/results/practice2/") && tab.href === "/results/practice2/1" ||
          pathname.startsWith("/results/practice3/") && tab.href === "/results/practice3/1";

        return (
          <Link
            key={tab.href}
            href={href}
            style={{
              ...baseStyle,
              background: active ? "#7c3aed" : "#131942",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
