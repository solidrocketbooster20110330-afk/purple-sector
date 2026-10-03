"use client";

import BottomNav from "../../../components/BottomNav";
import { useEffect, useState } from "react";
import ResultsTabs from "../../ResultsTabs";
import { useParams } from "next/navigation";
import {
  fetchGrandPrix,
  getGrandPrixByRound,
  getLatestGrandPrix,
  getStoredGrandPrixRound,
} from "../../../../lib/grandPrix";

type OpenF1Session = {
  session_key: number;
  session_name: string;
  date_start: string;
  country_name?: string;
  location?: string;
  is_cancelled?: boolean;
};

type Result = {
  position: number;
  driver_number: number;
  duration?: number;
  gap_to_leader?: number;
  number_of_laps?: number;
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
};

type Driver = {
  driver_number: number;
  full_name: string;
  team_name: string;
};

type Row = Result & {
  full_name: string;
  team_name: string;
};

const SESSION_NAME = "Practice 1";

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
  color: "white",
  padding: "24px",
  paddingBottom: "100px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#131942",
  border: "1px solid #2b347a",
  borderRadius: "20px",
  padding: "20px",
  overflowX: "auto" as const,
};

const headers = ["POS", "NO", "DRIVER", "TEAM", "TIME", "GAP", "LAPS"];
const gridColumns = "56px 56px minmax(150px, 1.4fr) minmax(120px, 1fr) 110px 100px 70px";

function formatTime(duration?: number) {
  if (!Number.isFinite(duration)) return "-";
  const ms = Math.round((duration as number) * 1000);
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes > 0 ? `${minutes}:` : ""}${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function formatGap(gap?: number) {
  if (!Number.isFinite(gap) || gap === 0) return "LEADER";
  return `+${(gap as number).toFixed(3)}s`;
}

function statusText(row: Row) {
  if (row.dsq) return "DSQ";
  if (row.dns) return "DNS";
  if (row.dnf) return "DNF";
  return formatTime(row.duration);
}



function sessionLabel(session: OpenF1Session | null, raceName?: string) {
  return raceName ?? (
    session
      ? `${session.country_name ?? session.location ?? "Latest"} Grand Prix`
      : "Latest Grand Prix"
  );
}

export default function PracticePage() {
  const [sessions, setSessions] = useState<OpenF1Session[]>([]);
  const [selected, setSelected] = useState<OpenF1Session | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [races, setRaces] = useState<Array<{ season: string; round: string; raceName: string }>>([]);
  const params = useParams<{ round: string }>();
  const routeRound = params?.round ?? "";
  const [selectedRace, setSelectedRace] = useState<{ season: string; round: string; raceName: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchGrandPrix(),
      fetch("https://api.openf1.org/v1/sessions").then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([gpList, sessionData]) => {
        if (cancelled) return;

        const storedRound = getStoredGrandPrixRound();
        const selectedGp =
          getGrandPrixByRound(gpList, routeRound) ??
          getGrandPrixByRound(gpList, storedRound) ??
          getLatestGrandPrix(gpList);

        setRaces(gpList);
        setSelectedRace(selectedGp);

        const allSessions = (Array.isArray(sessionData) ? sessionData : [])
          .filter((session: OpenF1Session) =>
            session.session_name === SESSION_NAME &&
            Number.isFinite(new Date(session.date_start).getTime()) &&
            new Date(session.date_start).getTime() <= Date.now() &&
            !session.is_cancelled
          )
          .sort(
            (a: OpenF1Session, b: OpenF1Session) =>
              new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
          );

        setSessions(allSessions);

        if (!selectedGp) {
          setSelected(allSessions[0] ?? null);
          return;
        }

        const gpIndex = gpList.findIndex((race: { round: string }) => race.round === selectedGp.round);
        const matchingSession = gpIndex >= 0
          ? allSessions[allSessions.length - 1 - gpIndex]
          : undefined;

        setSelected(matchingSession ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [routeRound]);

  useEffect(() => {
    if (!selected) return;
    setRows([]);
    fetch(`https://api.openf1.org/v1/session_result?session_key=${selected.session_key}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const results = (Array.isArray(data) ? data : [])
          .filter((result: Result) =>
            Number.isFinite(result.position) &&
            Number.isFinite(result.driver_number)
          )
          .sort((a: Result, b: Result) => a.position - b.position);

        return Promise.all([
          results,
          fetch(`https://api.openf1.org/v1/drivers?session_key=${selected.session_key}`)
            .then((res) => (res.ok ? res.json() : [])),
        ]);
      })
      .then(([results, drivers]) => {
        const driverList = Array.isArray(drivers) ? drivers : [];
        setRows(results.map((result: Result) => {
          const driver = driverList.find(
            (item: Driver) => item.driver_number === result.driver_number
          );
          return {
            ...result,
            full_name: driver?.full_name ?? `Driver #${result.driver_number}`,
            team_name: driver?.team_name ?? "Unknown Team",
          };
        }));
      });
  }, [selected]);

  return (
    <main style={pageStyle}>
      <h1>🛠 Practice 1</h1>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: 0,
            border: 0,
            background: "transparent",
            color: "#a9adff",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          <span>{selectedRace?.raceName ?? (loading ? "Loading..." : "Latest Grand Prix")}</span>
          <span style={{ fontSize: "12px" }}>{open ? "▲" : "▼"}</span>
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "32px",
              left: 0,
              right: 0,
              zIndex: 20,
              background: "#131942",
              border: "1px solid #2b347a",
              borderRadius: "14px",
              padding: "8px",
              maxHeight: "320px",
              overflowY: "auto",
              boxShadow: "0 12px 30px rgba(0,0,0,.35)",
            }}
          >
            {races.slice().reverse().map((race) => (
              <button
                key={`${race.season}-${race.round}`}
                type="button"
                onClick={() => {
                  localStorage.setItem("selectedGrandPrix", race.round);
                  setSelectedRace(race);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "block",
                  textAlign: "left",
                  padding: "10px 12px",
                  marginBottom: "4px",
                  border: 0,
                  borderRadius: "10px",
                  background: selectedRace?.round === race.round ? "#7c3aed" : "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {race.raceName}
              </button>
            ))}
          </div>
        )}
      </div>

      <ResultsTabs />

      <div style={cardStyle}>
        {rows.length === 0 ? (
          <p>{loading ? "결과를 불러오는 중..." : SESSION_NAME + " 데이터 없음"}</p>
        ) : (
          <table style={{ width: "100%", minWidth: "760px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: header === "DRIVER" || header === "TEAM" ? "left" : "center",
                      padding: "11px 7px",
                      color: "#a9adff",
                      fontSize: "12px",
                      borderBottom: "1px solid #2b347a",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.driver_number}>
                  <td style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>P{row.position}</td>
                  <td style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>#{row.driver_number}</td>
                  <td style={cellStyle}>{row.full_name}</td>
                  <td style={{ ...cellStyle, color: "#a9adff" }}>{row.team_name}</td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>{statusText(row)}</td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {row.dnf || row.dns || row.dsq ? "-" : formatGap(row.gap_to_leader)}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>{row.number_of_laps ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

const cellStyle = {
  padding: "11px 7px",
  borderBottom: "1px solid #222a66",
  whiteSpace: "nowrap" as const,
};
