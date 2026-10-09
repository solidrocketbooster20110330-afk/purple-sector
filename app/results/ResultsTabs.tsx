"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchGrandPrix,
  getGrandPrixByRound,
  getRelevantGrandPrix,
  hasSprintWeekend,
  type GrandPrix,
} from "../../lib/grandPrix";

const baseStyle = {
  minWidth: "150px",
  flexShrink: 0,
  padding: "14px 18px",
  borderRadius: "16px",
  textAlign: "center" as const,
  textDecoration: "none",
  fontWeight: "bold",
  color: "white",
  border: "1px solid #3a1217",
};

export default function ResultsTabs() {
  const pathname = usePathname();
  const practiceMatch = pathname.match(/^\/results\/practice(?:2|3)?\/(\d+|latest)$/);
  const [queryRound, setQueryRound] = useState<string | null>(null);
  const currentRound = (practiceMatch?.[1] === "latest" ? null : practiceMatch?.[1]) ?? queryRound;
  const [race, setRace] = useState<GrandPrix | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQueryRound(params.get("round"));
  }, [pathname]);

  useEffect(() => {
    fetchGrandPrix()
      .then((races) => {
        const selected =
          getGrandPrixByRound(races, currentRound) ??
          getRelevantGrandPrix(races) ??
          null;
        setRace(selected);
      })
      .catch(() => setRace(null));
  }, [currentRound]);

  const effectiveRound = currentRound ?? race?.round;
  const sprint = hasSprintWeekend(race);

  const tabs = [
    {
      href: effectiveRound ? `/results?round=${effectiveRound}` : "/results",
      label: "🏁 Race",
      active: pathname === "/results",
    },
    {
      href: effectiveRound ? `/results/qualifying?round=${effectiveRound}` : "/results/qualifying",
      label: "⚡ Qualifying",
      active: pathname === "/results/qualifying",
    },
    {
      href: `/results/practice/${effectiveRound ?? "latest"}`,
      label: "🛠 FP1",
      active: pathname.startsWith("/results/practice/"),
    },
    {
      href: `/results/practice2/${effectiveRound ?? "latest"}`,
      label: sprint ? "🏎️ Sprint Qualifying" : "🛠 FP2",
      active: pathname.startsWith("/results/practice2/"),
    },
    {
      href: `/results/practice3/${effectiveRound ?? "latest"}`,
      label: sprint ? "🏁 Sprint" : "🛠 FP3",
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
            background: tab.active ? "#c4162a" : "#101010",
          }}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
