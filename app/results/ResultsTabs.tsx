"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
          key={tab.href}
          href={tab.href}
          style={{
            ...baseStyle,
            background: pathname === tab.href ? "#7c3aed" : "#131942",
          }}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
