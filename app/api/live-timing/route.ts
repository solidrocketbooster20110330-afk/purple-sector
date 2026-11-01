const API = "https://api.openf1.org/v1";
let lastRequestAt = 0;

async function rows(path: string, token?: string, onAuthRejected?: () => void) {
  const wait = Math.max(0, 400 - (Date.now() - lastRequestAt));
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();

  const request = (accessToken?: string) => fetch(`${API}/${path}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    next: { revalidate: accessToken ? 0 : 30 },
  });

  let res = await request(token);
  if (res.status === 401 && token) {
    onAuthRejected?.();
    res = await request();
  }
  if (!res.ok) throw new Error(`OpenF1 request failed: ${res.status}`);
  return res.json() as Promise<any[]>;
}

export async function GET() {
  try {
    const token = process.env.OPENF1_ACCESS_TOKEN;
    let authRejected = false;
    const onAuthRejected = () => { authRejected = true; };
    const year = new Date().getUTCFullYear();
    const sessions = await rows(`sessions?year=${year}`, token, onAuthRejected);
    const now = Date.now();
    const active = sessions.find((s) => Date.parse(s.date_start) <= now && Date.parse(s.date_end) >= now);
    const completed = sessions
      .filter((s) => s.date_end && Date.parse(s.date_end) < now)
      .sort((a, b) => Date.parse(a.date_end) - Date.parse(b.date_end));
    const session = token && !authRejected && active ? active : completed[completed.length - 1];

    if (!session) {
      return Response.json({ source: "OpenF1", freshness: "unavailable", session: null, drivers: [], message: "No published session data." });
    }

    const key = session.session_key;
    const drivers = await rows(`drivers?session_key=${key}`, authRejected ? undefined : token, onAuthRejected);
    const results = await rows(`session_result?session_key=${key}`, authRejected ? undefined : token, onAuthRejected).catch(() => []);
    const laps = await rows(`laps?session_key=${key}`, authRejected ? undefined : token, onAuthRejected).catch(() => []);
    const intervals = await rows(`intervals?session_key=${key}`, authRejected ? undefined : token, onAuthRejected).catch(() => []);
    const stints = await rows(`stints?session_key=${key}`, authRejected ? undefined : token, onAuthRejected).catch(() => []);
    const weather = await rows(`weather?session_key=${key}`, authRejected ? undefined : token, onAuthRejected).catch(() => []);
    const raceControl = await rows(`race_control?session_key=${key}`, authRejected ? undefined : token, onAuthRejected).catch(() => []);

    const latest = new Map<string, any>();
    const best = new Map<string, number>();
    for (const lap of laps) {
      const id = String(lap.driver_number);
      const old = latest.get(id);
      if (!old || String(lap.date) > String(old.date)) latest.set(id, lap);
      if (typeof lap.lap_duration === "number") best.set(id, Math.min(best.get(id) ?? Infinity, lap.lap_duration));
    }
    const lastInterval = new Map<string, any>();
    for (const item of intervals) {
      const id = String(item.driver_number);
      const old = lastInterval.get(id);
      if (!old || String(item.date) > String(old.date)) lastInterval.set(id, item);
    }
    const lastStint = new Map<string, any>();
    for (const item of stints) {
      const id = String(item.driver_number);
      const old = lastStint.get(id);
      if (!old || Number(item.stint_number) > Number(old.stint_number)) lastStint.set(id, item);
    }
    const resultByDriver = new Map(results.map((r) => [String(r.driver_number), r]));

    const timing = drivers.map((d) => {
      const id = String(d.driver_number);
      const lap = latest.get(id);
      const result = resultByDriver.get(id);
      const gap = lastInterval.get(id);
      const stint = lastStint.get(id);
      return {
        number: d.driver_number,
        code: d.name_acronym ?? d.broadcast_name?.slice(0, 3) ?? "—",
        name: d.full_name ?? d.broadcast_name ?? "Unknown",
        team: d.team_name ?? "—",
        teamColour: d.team_colour ? `#${String(d.team_colour).replace("#", "")}` : "#888",
        position: result?.position ?? null,
        gap: gap?.gap_to_leader ?? result?.gap_to_leader ?? null,
        interval: gap?.interval ?? null,
        lastLap: lap?.lap_duration ?? null,
        bestLap: best.get(id) ?? null,
        sectors: [lap?.duration_sector_1 ?? null, lap?.duration_sector_2 ?? null, lap?.duration_sector_3 ?? null],
        tyre: stint?.compound ?? null,
        laps: result?.number_of_laps ?? lap?.lap_number ?? null,
      };
    }).sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

    const weatherNow = weather[weather.length - 1] ?? null;
    const live = Boolean(token && !authRejected && active && String(active.session_key) === String(key));
    return Response.json({
      source: "OpenF1",
      freshness: live ? "live" : "historical",
      updatedAt: new Date().toISOString(),
      session: {
        meeting: session.meeting_name ?? session.circuit_short_name ?? "Formula 1",
        name: session.session_name ?? session.session_type ?? "Session",
        circuit: session.circuit_short_name ?? session.location ?? "—",
        location: session.location ?? "",
        country: session.country_name ?? "",
        start: session.date_start,
        end: session.date_end,
      },
      drivers: timing,
      weather: weatherNow ? {
        air: weatherNow.air_temperature ?? null,
        track: weatherNow.track_temperature ?? null,
        wind: weatherNow.wind_speed ?? null,
        rain: weatherNow.rainfall ?? null,
      } : null,
      raceControl: raceControl.slice(-8).reverse().map((item) => ({
        date: item.date, category: item.category, flag: item.flag, message: item.message,
      })),
      status: live ? "LIVE" : "SESSION COMPLETED",
      note: live ? "Authenticated OpenF1 live data." : "Published historical data. Real-time feed requires authenticated OpenF1 live access.",
    }, { headers: { "Cache-Control": live ? "no-store" : "s-maxage=30, stale-while-revalidate=60" } });
  } catch (error) {
    console.error("OpenF1 timing error:", error);
    const detail = error instanceof Error ? error.message : "Unknown OpenF1 error";
    return Response.json({ source: "OpenF1", freshness: "unavailable", error: `OpenF1 connection failed: ${detail}`, drivers: [] }, { status: 502 });
  }
}
