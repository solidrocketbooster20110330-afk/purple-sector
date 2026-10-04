"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchGrandPrix,
  getGrandPrixByRound,
  getStoredGrandPrixRound,
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
  border: "1px solid #2b347a",
};

export default function ResultsTabs() {
  const pathname = usePathname();
  const practiceMatch = pathname.match(/^\/results\/practice(?:2|3)?\/(\d+)$/);
  const [queryRound, setQueryRound] = useState<string | null>(null);
  const currentRound = practiceMatch?.[1] ?? queryRound;
  const [race, setRace] = useState<GrandPrix | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQueryRound(params.get("round"));
  }, [pathname]);

  useEffect(() => {
    const round = currentRound ?? getStoredGrandPrixRound();

    fetchGrandPrix()
      .then((races) => {
        const selected = getGrandPrixByRound(races, round) ?? races[races.length - 1] ?? null;
        setRace(selected);
      })
      .catch(() => setRace(null));
  }, [currentRound]);

  const sprint = hasSprintWeekend(race);

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
      href: currentRound
        ? `/results/practice2/${currentRound}`
        : "/results/practice2/1",
      label: sprint ? "🏎️ Sprint Qualifying" : "🛠 FP2",
      active: pathname.startsWith("/results/practice2/"),
    },
    {
      href: currentRound
        ? `/results/practice3/${currentRound}`
        : "/results/practice3/1",
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
            background: tab.active ? "#7c3aed" : "#131942",
          }}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
