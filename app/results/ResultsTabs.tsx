"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  const practiceMatch = pathname.match(/^\/results\/practice(?:2|3)?\/(\d+)$/);
  const currentRound = practiceMatch?.[1] ?? null;

  const tabs = [
    {
      href: currentRound ? `/results?round=${currentRound}` : "/results",
      label: "🏁 Race",
      active: pathname === "/results",
    },
    {
      href: currentRound ? `/results/qualifying?round=${currentRound}` : "/results/qualifying",
      label: "⚡ Qualifying",
      active: pathname === "/results/qualifying",
    },
    {
      href: currentRound ? `/results/practice/${currentRound}` : "/results/practice/1",
      label: "🛠 FP1",
      active: pathname.startsWith("/results/practice/"),
    },
    {
      href: currentRound ? `/results/practice2/${currentRound}` : "/results/practice2/1",
      label: "🛠 FP2",
      active: pathname.startsWith("/results/practice2/"),
    },
    {
      href: currentRound ? `/results/practice3/${currentRound}` : "/results/practice3/1",
      label: "🛠 FP3",
      active: pathname.startsWith("/results/practice3/"),
    },
  ];

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
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          style={{
            ...baseStyle,
            background: tab.active ? "#7c3aed" : "#131942",
          }}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
