"use client";

import { useEffect, useMemo, useState } from "react";

type NextSessionCountdownProps = {
  label: string;
  raceName: string;
  targetTime: number;
};

function formatCountdown(ms: number) {
  if (ms <= 0) return "00d 00h 00m 00s";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    `${String(days).padStart(2, "0")}d`,
    `${String(hours).padStart(2, "0")}h`,
    `${String(minutes).padStart(2, "0")}m`,
    `${String(seconds).padStart(2, "0")}s`,
  ].join(" ");
}

export default function NextSessionCountdown({
  label,
  raceName,
  targetTime,
}: NextSessionCountdownProps) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const remaining = useMemo(
    () => Math.max(0, targetTime - now),
    [targetTime, now]
  );

  return (
    <section
      style={{
        background:
          "linear-gradient(135deg,#171d57 0%,#24105a 55%,#131942 100%)",
        border: "1px solid #4b3c9a",
        borderRadius: "16px",
        padding: "12px",
        marginBottom: "8px",
        boxShadow: "0 12px 30px rgba(91,54,180,0.18)",
      }}
    >
      <div
        style={{
          color: "#b9bdff",
          fontSize: "12px",
          fontWeight: "bold",
          letterSpacing: "0.12em",
        }}
      >
        NEXT SESSION
      </div>

      <div
        style={{
          marginTop: "3px",
          fontSize: "20px",
          fontWeight: "800",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#c7cbff",
          marginTop: "5px",
          fontSize: "13px",
        }}
      >
        {raceName}
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "clamp(22px, 7vw, 34px)",
          lineHeight: 1,
          fontWeight: "900",
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatCountdown(remaining)}
      </div>
    </section>
  );
}
