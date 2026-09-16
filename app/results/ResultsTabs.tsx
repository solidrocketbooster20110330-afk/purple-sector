"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ResultsTabs() {
  const pathname = usePathname();

  const buttonStyle = (
    active: boolean
  ) => ({
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    textDecoration: "none",
    textAlign: "center" as const,
    background: active
      ? "#7c3aed"
      : "#131942",
    color: "white",
    fontWeight: "bold",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      <Link
        href="/results"
        style={buttonStyle(
          pathname === "/results"
        )}
      >
        🏁 Race
      </Link>

      <Link
        href="/results/qualifying"
        style={buttonStyle(
          pathname ===
            "/results/qualifying"
        )}
      >
        ⚡ Qualifying
      </Link>
    </div>
  );
}
