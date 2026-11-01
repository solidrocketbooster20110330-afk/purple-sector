"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import "./live-timing.css";

type Driver = {
  number: number; code: string; name: string; team: string; teamColour: string;
  position: number | null; gap: number | string | null; interval: number | string | null;
  lastLap: number | null; bestLap: number | null; sectors: (number | null)[];
  tyre: string | null; laps: number | null;
};
type TimingData = {
  source: string; freshness: string; updatedAt?: string;
  session: { meeting: string; name: string; circuit: string; location: string; country: string; start: string; end: string } | null;
  drivers: Driver[]; weather?: { air: number | null; track: number | null; wind: number | null; rain: boolean | null } | null;
  raceControl?: { date: string; category: string; flag?: string; message?: string }[];
  status?: string; note?: string; error?: string;
};

function lapTime(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  const m = Math.floor(value / 60);
  return m ? `${m}:${(value - m * 60).toFixed(3).padStart(6, "0")}` : value.toFixed(3);
}
function gap(value: number | string | null | undefined, position: number | null) {
  if (position === 1) return "LEADER";
  if (value == null) return "—";
  return typeof value === "number" ? `+${value.toFixed(3)}` : String(value);
}
function shortDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function LiveTimingPage() {
  const [data, setData] = useState<TimingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/live-timing", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Could not load timing data");
      setData(json);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Data unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60000);
    return () => window.clearInterval(timer);
  }, [load]);

  const tyres = useMemo(() => {
    const counts = new Map<string, number>();
    for (const driver of data?.drivers ?? []) {
      if (driver.tyre) counts.set(driver.tyre.toUpperCase(), (counts.get(driver.tyre.toUpperCase()) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [data]);

  const session = data?.session;
  const weather = data?.weather;

  return (
    <main className="ps-live">
      <section className="ps-session">
        <div className="ps-session-title">
          <div>
            <span className="eyebrow">FIA FORMULA ONE WORLD CHAMPIONSHIP · OPENF1</span>
            <h1>{session?.meeting?.toUpperCase() ?? "LIVE TIMING"} <em>{session ? "SESSION" : ""}</em></h1>
            <p>{session ? `${session.circuit} · ${session.location} ${session.country}` : "WAITING FOR SESSION DATA"}</p>
          </div>
          <div className="ps-session-clock">
            <span>SESSION</span><strong>{session?.name ?? (loading ? "LOADING" : "—")}</strong>
            <small>{data?.freshness === "live" ? "LIVE FEED" : "PUBLISHED DATA"}</small>
          </div>
        </div>
        <div className="ps-session-meta">
          <span className={data?.freshness === "live" ? "green-dot" : "pulse-dot"} />
          {data?.freshness === "live" ? "LIVE SESSION" : data?.freshness === "historical" ? "LATEST PUBLISHED SESSION" : loading ? "LOADING DATA" : "DATA UNAVAILABLE"}
          <b>{session?.name?.toUpperCase() ?? "—"}</b>
          <span className="meta-sep" /> {session ? shortDate(session.start) : "—"}
          <span className="meta-spacer" />
          <span className="weather">AIR <b>{weather?.air == null ? "—" : `${weather.air}°C`}</b></span>
          <span className="weather">TRACK <b>{weather?.track == null ? "—" : `${weather.track}°C`}</b></span>
          <span className="weather">WIND <b>{weather?.wind == null ? "—" : `${weather.wind} m/s`}</b></span>
        </div>
      </section>

      <div className="ps-layout">
        <section className="ps-main-column">
          <div className="ps-section-heading">
            <div><span className="eyebrow">SESSION CLASSIFICATION</span><h2>Timing Tower</h2></div>
            <div className="ps-updated"><span className="pulse-dot" /> {data?.freshness === "live" ? "LIVE DATA" : "OFFICIAL PUBLISHED DATA"}<small>{data?.updatedAt ? shortDate(data.updatedAt) : "—"}</small></div>
          </div>
          {error && <div className="ps-panel"><b>데이터 연결 오류</b><p className="ps-disclaimer">{error}</p><button onClick={() => { setLoading(true); void load(); }}>다시 불러오기</button></div>}
          <div className="ps-table-wrap">
            <table className="ps-timing-table">
              <thead><tr><th>POS</th><th>DRIVER</th><th>GAP</th><th>INT</th><th>LAST LAP</th><th>BEST</th><th>S1</th><th>S2</th><th>S3</th><th>TYRE</th><th>LAPS</th></tr></thead>
              <tbody>
                {(data?.drivers ?? []).map((d) => (
                  <tr key={d.number} className={d.position === 1 ? "leader" : ""}>
                    <td className="pos">{d.position == null ? "—" : String(d.position).padStart(2, "0")}</td>
                    <td><div className="driver-cell"><i style={{ background: d.teamColour }} /><span className="driver-number">{d.number}</span><span className="driver-name"><b>{d.code}</b><small>{d.name} · {d.team}</small></span></div></td>
                    <td className="gap">{gap(d.gap, d.position)}</td><td>{d.interval == null ? "—" : typeof d.interval === "number" ? `+${d.interval.toFixed(3)}` : d.interval}</td>
                    <td className="lap-time">{lapTime(d.lastLap)}</td><td>{lapTime(d.bestLap)}</td>
                    {d.sectors.map((sector, i) => <td key={i}>{lapTime(sector)}</td>)}
                    <td>{d.tyre ? <span className={"tyre " + (d.tyre.toLowerCase().includes("soft") ? "s" : d.tyre.toLowerCase().includes("medium") ? "m" : "h")}>{d.tyre[0]}</span> : "—"}</td>
                    <td>{d.laps ?? "—"}</td>
                  </tr>
                ))}
                {!data?.drivers?.length && <tr><td colSpan={11} style={{ textAlign: "center", padding: 28 }}>{loading ? "OpenF1 데이터를 불러오는 중…" : "표시할 세션 데이터가 없습니다."}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="ps-table-foot"><span>{data?.drivers?.length ?? 0} DRIVERS · OPENF1</span><span>— MEANS NO SOURCE VALUE</span></div>

          <section className="ps-panel" id="telemetry">
            <div className="ps-panel-heading"><div><span className="eyebrow">CAR PERFORMANCE</span><h2>Telemetry Overview</h2></div><span className="panel-tag">SOURCE DATA ONLY</span></div>
            <p className="ps-disclaimer">현재 선택된 세션에서 확인 가능한 차량 텔레메트리가 없으면 임의의 숫자를 표시하지 않아. 실시간 차량 텔레메트리는 인증된 라이브 데이터 연결 후 활성화할 수 있어.</p>
            <div className="ps-telemetry-grid">
              {["SPEED", "THROTTLE", "BRAKE", "GEAR", "ENGINE RPM", "DRS"].map((label) => <div className="telemetry-stat" key={label}><span>{label}</span><strong>—</strong><div className="telemetry-note">NO SOURCE VALUE</div></div>)}
            </div>
          </section>
        </section>

        <aside className="ps-side-column">
          <section className="ps-panel track-panel" id="track"><div className="ps-panel-heading"><div><span className="eyebrow">CIRCUIT</span><h2>Track Map</h2></div><span className="panel-tag">{session?.circuit ?? "—"}</span></div><div className="track-placeholder"><span className="map-watermark">TRACK GEOMETRY NOT PROVIDED BY THIS FEED</span></div><p className="ps-disclaimer">서킷 좌표 데이터가 연결되면 실제 차량 위치를 표시할 예정이야.</p></section>

          <section className="ps-panel" id="strategy"><div className="ps-panel-heading"><div><span className="eyebrow">RACE CONTROL</span><h2>Latest Messages</h2></div></div>
            {(data?.raceControl ?? []).slice(0, 5).map((item, i) => <div className="status-row" key={i}><span>{item.category ?? "EVENT"}</span><b>{item.flag ?? item.message ?? "—"}</b></div>)}
            {!data?.raceControl?.length && <p className="ps-disclaimer">이 세션의 레이스 컨트롤 메시지가 없어.</p>}
          </section>

          <section className="ps-panel"><div className="ps-panel-heading"><div><span className="eyebrow">PIT STRATEGY</span><h2>Tyre Distribution</h2></div></div>
            {tyres.length ? <div className="tyre-bars">{tyres.map(([compound, count]) => <div key={compound}><span className={"tyre " + (compound.includes("SOFT") ? "s" : compound.includes("MEDIUM") ? "m" : "h")}>{compound[0]}</span><div className="bar"><i style={{ width: `${count / Math.max(data?.drivers.length ?? 1, 1) * 100}%` }} /></div><b>{count}</b></div>)}</div> : <p className="ps-disclaimer">타이어 스틴트 데이터가 제공되지 않아.</p>}
          </section>
        </aside>
      </div>
      <footer className="ps-footer"><span>PURPLE<span>SECTOR</span></span><span>DATA: OPENF1 · {data?.freshness === "live" ? "LIVE" : "HISTORICAL / PUBLISHED"}</span></footer>
    </main>
  );
}
