"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ChampionshipPage() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/championship",
      label: "👤 Drivers",
    },
    {
      href: "/championship/constructors",
      label: "🏭 Constructors",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#2b2f33",
        color: "#f2f2f2",
        padding: "24px",
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginTop: 0 }}>🏆 Championship</h1>

      <div
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          marginTop: "24px",
          marginBottom: "20px",
          paddingBottom: "4px",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;

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
                background: active ? "#7c3aed" : "#3a3f45",
                border: "1px solid #5a6169",
                color: "white",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <p style={{ color: "#d7dadd", marginBottom: "20px" }}>
        Select a championship category above.
      </p>

      <div
        style={{
          background: "#3a3f45",
          border: "1px solid #5a6169",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        <strong>Drivers</strong>
        <div style={{ marginTop: "8px", color: "#d7dadd" }}>
          View the current driver standings.
        </div>
      </div>
    </main>
  );
}
