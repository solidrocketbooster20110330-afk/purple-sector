"use client";

import BottomNav from "../../../components/BottomNav";
import { useEffect, useState } from "react";
import ResultsTabs from "../../ResultsTabs";
import { useParams } from "next/navigation";
import {
  fetchGrandPrix,
  getGrandPrixByRound,
  getLatestGrandPrix,
  getRelevantGrandPrix,
  getSessionTargetTime,
  getStoredGrandPrixRound,
  getWeekendSessionName,
  type GrandPrix,
} from "../../../../lib/grandPrix";

type OpenF1Session = {
  session_key: number;
  session_name: string;
  date_start: string;
  country_name?: string;
  location?: string;
  is_cancelled?: boolean;
};

type PracticeResult = {
  position: number;
  driver_number: number;
  duration?: number;
  gap_to_leader?: number | string;
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

type Row = PracticeResult & {
  full_name: string;
  team_name: string;
};

type SprintResult = {
  number: string;
  position: string;
  grid: string;
  points: string;
  status: string;
  Time?: { time: string };
  Driver: { givenName: string; familyName: string };
  Constructor: { name: string };
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
  color: "white",
  padding: "20px",
  paddingBottom: "90px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#101010",
  border: "1px solid #3a1217",
  borderRadius: "20px",
  padding: "20px",
  overflowX: "auto" as const,
};

const raceHeaders = ["POS", "NO", "DRIVER", "TEAM", "GRID", "STATUS", "PTS"];
const practiceHeaders = ["POS", "NO", "DRIVER", "TEAM", "TIME", "GAP", "LAPS"];

function positionLabel(position: string) {
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return `P${position}`;
}

function formatTime(duration?: number | null) {
  if (!Number.isFinite(duration)) return "-";
  const ms = Math.round((duration as number) * 1000);
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  return `${minutes > 0 ? `${minutes}:` : ""}${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function formatGap(gap?: number | string | null) {
  if (gap === 0) return "LEADER";
  if (typeof gap === "string") return gap;
  if (!Number.isFinite(gap) || gap === undefined || gap === null) return "-";
  return `+${gap.toFixed(3)}s`;
}

function practiceStatus(row: Row) {
  if (row.dsq) return "DSQ";
  if (row.dns) return "DNS";
  if (row.dnf) return "DNF";
  return formatTime(row.duration);
}

function sprintStatus(result: SprintResult) {
  if (result.status?.includes("Lap")) {
    const laps = result.status.match(/\d+/)?.[0] ?? "1";
    return `+${laps} Lap`;
  }

  if (result.status === "Finished") {
    return result.Time?.time ?? "Finished";
  }

  return "DNF";
}

function sessionLabel(session: OpenF1Session | null) {
  return session
    ? `${session.country_name ?? session.location ?? "Latest"} Grand Prix`
    : "Latest Grand Prix";
}

export default function PracticePage() {
  const params = useParams<{ round: string }>();
  const routeRound = params?.round ?? "";

  const [selected, setSelected] = useState<OpenF1Session | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [sprintResults, setSprintResults] = useState<SprintResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [races, setRaces] = useState<GrandPrix[]>([]);
  const [selectedRace, setSelectedRace] = useState<GrandPrix | null>(null);

  const sessionName = getWeekendSessionName(selectedRace, "Practice 3");
  const isSprint = sessionName === "Sprint";

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchGrandPrix(),
      fetch("https://api.openf1.org/v1/sessions?year=2026").then((res) =>
        res.ok ? res.json() : []
      ),
    ])
      .then(([gpList, sessionData]) => {
        if (cancelled) return;

        const storedRound = getStoredGrandPrixRound();
        const selectedGp =
          getGrandPrixByRound(gpList, routeRound) ??
          getGrandPrixByRound(gpList, storedRound) ??
          getRelevantGrandPrix(gpList) ??
          getLatestGrandPrix(gpList);

        setRaces(gpList);
        setSelectedRace(selectedGp);
        setRows([]);
        setSprintResults([]);

        if (!selectedGp) {
          setSelected(null);
          return;
        }

        const selectedSessionName = getWeekendSessionName(
          selectedGp,
          "Practice 3"
        );

        if (selectedSessionName === "Sprint") {
          setSelected(null);
          return;
        }

        const targetTime = getSessionTargetTime(
          selectedGp,
          selectedSessionName
        );

        const matchingSessions = (Array.isArray(sessionData) ? sessionData : [])
          .filter(
            (session: OpenF1Session) =>
              session.session_name === selectedSessionName &&
              !session.is_cancelled &&
              Number.isFinite(new Date(session.date_start).getTime()) &&
              new Date(session.date_start).getTime() <= Date.now()
          )
          .sort(
            (a: OpenF1Session, b: OpenF1Session) =>
              new Date(a.date_start).getTime() -
              new Date(b.date_start).getTime()
          );

        const matchingSession = Number.isFinite(targetTime)
          ? matchingSessions
              .filter(
                (session: OpenF1Session) =>
                  Math.abs(
                    new Date(session.date_start).getTime() - targetTime
                  ) <=
                  6 * 60 * 60 * 1000
              )
              .sort(
                (a: OpenF1Session, b: OpenF1Session) =>
                  Math.abs(new Date(a.date_start).getTime() - targetTime) -
                  Math.abs(new Date(b.date_start).getTime() - targetTime)
              )[0] ?? null
          : null;

        setSelected(matchingSession);
      })
      .catch(() => {
        if (!cancelled) {
          setRaces([]);
          setSelected(null);
          setRows([]);
          setSprintResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [routeRound]);

  useEffect(() => {
    if (!selected || isSprint) return;

    let cancelled = false;

    fetch(
      `https://api.openf1.org/v1/session_result?session_key=${selected.session_key}`
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return;

        const results = (Array.isArray(data) ? data : [])
          .filter(
            (result: PracticeResult) =>
              Number.isFinite(result.position) &&
              Number.isFinite(result.driver_number)
          )
          .sort((a: PracticeResult, b: PracticeResult) => a.position - b.position);

        return fetch(
          `https://api.openf1.org/v1/drivers?session_key=${selected.session_key}`
        )
          .then((res) => (res.ok ? res.json() : []))
          .then((drivers) => [results, drivers] as const);
      })
      .then((payload) => {
        if (!payload || cancelled) return;

        const [results, drivers] = payload;
        const driverList = Array.isArray(drivers) ? (drivers as Driver[]) : [];

        setRows(
          results.map((result: PracticeResult) => {
            const driver = driverList.find(
              (item) => item.driver_number === result.driver_number
            );

            return {
              ...result,
              full_name:
                driver?.full_name ?? `Driver #${result.driver_number}`,
              team_name: driver?.team_name ?? "Unknown Team",
            };
          })
        );
      });

    return () => {
      cancelled = true;
    };
  }, [selected, isSprint]);

  useEffect(() => {
    if (!selectedRace || !isSprint) return;

    let cancelled = false;
    setSprintResults([]);

    fetch(
      `https://api.jolpi.ca/ergast/f1/${selectedRace.season}/${selectedRace.round}/sprint.json`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;

        setSprintResults(
          data?.MRData?.RaceTable?.Races?.[0]?.SprintResults ?? []
        );
      })
      .catch(() => {
        if (!cancelled) setSprintResults([]);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRace, isSprint]);

  return (
    <main style={pageStyle}>
      <h1>{isSprint ? "🏁 Sprint" : "🛠 Practice 3"}</h1>

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
            color: "#ef233c",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          <span>
            {selectedRace?.raceName ??
              (selected ? sessionLabel(selected) : loading ? "Loading..." : "Latest Grand Prix")}
          </span>
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
              background: "#101010",
              border: "1px solid #3a1217",
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
                  window.location.href = `/results/practice3/${race.round}`;
                }}
                style={{
                  width: "100%",
                  display: "block",
                  textAlign: "left",
                  padding: "10px 12px",
                  marginBottom: "4px",
                  border: 0,
                  borderRadius: "10px",
                  background:
                    selectedRace?.round === race.round
                      ? "#c4162a"
                      : "transparent",
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
        {isSprint ? (
          sprintResults.length === 0 ? (
            <p>
              {loading ? "결과를 불러오는 중..." : "Sprint 데이터 없음"}
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                minWidth: "760px",
                tableLayout: "fixed",
                borderCollapse: "collapse",
              }}
            >
              <colgroup>
                <col style={{ width: "60px" }} />
                <col style={{ width: "60px" }} />
                <col style={{ width: "190px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "70px" }} />
                <col style={{ width: "140px" }} />
                <col style={{ width: "60px" }} />
              </colgroup>
              <thead>
                <tr>
                  {raceHeaders.map((header) => (
                    <th
                      key={header}
                      style={{
                        padding: "12px 8px",
                        color: "#ef233c",
                        borderBottom: "2px solid #3a1217",
                        whiteSpace: "nowrap",
                        textAlign:
                          header === "DRIVER" || header === "TEAM"
                            ? "left"
                            : "center",
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sprintResults.map((driver) => {
                  const status = sprintStatus(driver);

                  return (
                    <tr key={driver.position}>
                      <td style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>
                        {positionLabel(driver.position)}
                      </td>
                      <td style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>
                        #{driver.number}
                      </td>
                      <td style={cellStyle}>
                        {driver.Driver.givenName} {driver.Driver.familyName}
                      </td>
                      <td style={{ ...cellStyle, color: "#ef233c" }}>
                        {driver.Constructor.name}
                      </td>
                      <td style={{ ...cellStyle, textAlign: "center" }}>
                        P{driver.grid ?? "-"}
                      </td>
                      <td
                        style={{
                          ...cellStyle,
                          textAlign: "center",
                          color: status === "DNF" ? "#ff7a7a" : "white",
                          fontWeight: status === "DNF" ? "bold" : "normal",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {status}
                      </td>
                      <td style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>
                        {driver.points ?? "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : rows.length === 0 ? (
          <p>
            {loading ? "결과를 불러오는 중..." : "Practice 3 데이터 없음"}
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              minWidth: "760px",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              <col style={{ width: "60px" }} />
              <col style={{ width: "60px" }} />
              <col style={{ width: "190px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "110px" }} />
            </colgroup>
            <thead>
              <tr>
                {practiceHeaders.map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "11px 7px",
                      color: "#ef233c",
                      borderBottom: "2px solid #3a1217",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      textAlign:
                        header === "DRIVER" || header === "TEAM"
                          ? "left"
                          : "center",
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
                  <td style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>
                    {positionLabel(String(row.position))}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>
                    #{row.driver_number}
                  </td>
                  <td style={cellStyle}>{row.full_name}</td>
                  <td style={{ ...cellStyle, color: "#ef233c" }}>{row.team_name}</td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {formatTime(row.duration)}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {formatGap(row.gap_to_leader)}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {row.number_of_laps ?? "-"}
                  </td>
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
  borderBottom: "1px solid #35191e",
  whiteSpace: "nowrap" as const,
};
