"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ResultsTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/results",
      label: "🏁 Race",
    },
    {
      href: "/results/qualifying",
      label: "⚡ Qualifying",
    },
    {
      href: "/results/practice/1",
      label: "🛠 FP1",
    },
    {
      href: "/results/practice2/1",
      label: "🛠 FP2",
    },
    {
      href: "/results/practice3/1",
      label: "🛠 FP3",
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
      {tabs.map((tab) => {
        const active =
          pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              minWidth: "150px",
              flexShrink: 0,
              padding: "14px 18px",
              borderRadius: "16px",
              textAlign: "center",
              textDecoration: "none",
              fontWeight: "bold",

              background: active
                ? "#7c3aed"
                : "#131942",

              border:
                "1px solid #2b347a",

              color: "white",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
