"use client";

import { useEffect, useMemo, useState } from "react";

type Session = { date?: string; time?: string };
type Race = {
  raceName: string;
  date: string;
  time?: string;
  round?: string;
  Circuit?: { circuitName?: string; Location?: { locality?: string; country?: string } };
  FirstPractice?: Session;
  SecondPractice?: Session;
  ThirdPractice?: Session;
  SprintQualifying?: Session;
  Sprint?: Session;
  Qualifying?: Session;
};

const sessionLabels: Array<[string, keyof Race]> = [
  ["FP1", "FirstPractice"],
  ["Sprint Qualifying", "SprintQualifying"],
  ["FP2", "SecondPractice"],
  ["Sprint", "Sprint"],
  ["FP3", "ThirdPractice"],
  ["Qualifying", "Qualifying"],
];

function sessionDate(session?: Session) {
  if (!session?.date) return null;
  return new Date(session.time ? `${session.date}T${session.time}` : `${session.date}T00:00:00Z`);
}

function koreaDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", ...options }).format(date);
}

function getFlag(country?: string) {
  const flags: Record<string, string> = {
    USA: "🇺🇸", "United States": "🇺🇸", "United States of America": "🇺🇸",
    Mexico: "🇲🇽", Brazil: "🇧🇷", Qatar: "🇶🇦", "United Arab Emirates": "🇦🇪",
    Australia: "🇦🇺", China: "🇨🇳", Japan: "🇯🇵", Bahrain: "🇧🇭",
    "Saudi Arabia": "🇸🇦", Italy: "🇮🇹", Monaco: "🇲🇨", Spain: "🇪🇸",
    Canada: "🇨🇦", Austria: "🇦🇹", "United Kingdom": "🇬🇧", Belgium: "🇧🇪",
    Hungary: "🇭🇺", Netherlands: "🇳🇱", Azerbaijan: "🇦🇿", Singapore: "🇸🇬",
  };
  return flags[country ?? ""] ?? "🏁";
}

export default function HomeRaceCard({ race }: { race: Race | null }) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const sessions = useMemo(() => {
    if (!race) return [];
    return sessionLabels
      .map(([label, key]) => ({ label, session: race[key] as Session | undefined }))
      .filter((item) => sessionDate(item.session))
      .map((item) => ({ ...item, date: sessionDate(item.session)! }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [race]);

  if (!race) return null;
  const fp1 = sessionDate(race.FirstPractice) ?? sessions[0]?.date ?? sessionDate({ date: race.date, time: race.time });
  const remaining = fp1 ? Math.max(0, fp1.getTime() - now) : 0;
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const rangeStart = sessions[0]?.date ?? new Date(race.date);
  const rangeEnd = sessionDate({ date: race.date, time: race.time }) ?? new Date(race.date);
  const dateRange = `${koreaDate(rangeStart, { month: "numeric", day: "numeric" })} – ${koreaDate(rangeEnd, { month: "numeric", day: "numeric" })}`;
  const country = race.Circuit?.Location?.country;
  const locality = race.Circuit?.Location?.locality;
  const circuit = race.Circuit?.circuitName;

  return (
    <a href="/schedule" style={{ display: "block", color: "white", textDecoration: "none", marginBottom: "16px" }}>
      <section style={{ borderRadius: "22px", padding: "24px 22px", background: "linear-gradient(145deg,#243b59 0%,#48202b 38%,#252326 72%,#171719 100%)", border: "1px solid #343039", boxShadow: "0 16px 36px #0008" }}>
        <div style={{ color: "#c5c1ca", fontSize: "13px", marginBottom: "14px" }}>다음 그랑프리 · {dateRange}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "24px", lineHeight: 1.2, fontWeight: 850 }}>
          <span style={{ fontSize: "30px" }}>{getFlag(country)}</span><span>{race.raceName}</span>
        </div>
        <div style={{ color: "#c7c1ca", fontSize: "13px", marginTop: "7px" }}>{locality ?? ""}{locality && country ? " · " : ""}{country ?? ""}{circuit ? ` · ${circuit}` : ""}</div>

        <div style={{ marginTop: "34px", color: "#d1cbd2", fontSize: "13px" }}>FP1 시작까지 · {fp1 ? koreaDate(fp1, { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }) : "일정 미정"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "10px", marginTop: "10px" }}>
          {[{ value: String(days).padStart(2,"0"), label: "일" },{ value: String(hours).padStart(2,"0"), label: "시간" },{ value: String(minutes).padStart(2,"0"), label: "분" }].map((item) => (
            <div key={item.label} style={{ borderRadius: "18px", background: "#ffffff18", padding: "15px 6px 12px", textAlign: "center", backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: "clamp(30px,8vw,48px)", fontWeight: 850, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>{item.value}</div>
              <div style={{ color: "#d8d1d8", fontSize: "13px", marginTop: "5px" }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ height: "1px", background: "#ffffff22", margin: "24px 0 12px" }} />
        <div style={{ display: "grid", gap: "0" }}>
          {sessions.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "52px", gap: "10px", fontSize: "15px" }}>
              <span style={{ color: item.label === "FP1" ? "white" : "#c7c1ca", fontWeight: item.label === "FP1" ? 800 : 500 }}>{item.label}</span>
              <span style={{ color: item.label === "FP1" ? "white" : "#d8d2d8", fontVariantNumeric: "tabular-nums" }}>
                <span style={{ color: "#88818b", marginRight: "12px" }}>{koreaDate(item.date, { weekday: "short" })}</span>
                {koreaDate(item.date, { hour: "2-digit", minute: "2-digit", hour12: false })}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "52px", fontSize: "15px" }}>
            <span style={{ color: "#c7c1ca" }}>레이스</span>
            <span style={{ color: "#d8d2d8", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: "#88818b", marginRight: "12px" }}>{koreaDate(rangeEnd, { weekday: "short" })}</span>
              {koreaDate(rangeEnd, { hour: "2-digit", minute: "2-digit", hour12: false })}
            </span>
          </div>
        </div>
      </section>
    </a>
  );
}
