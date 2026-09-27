type Session = {
  session_key: number;
  session_name: string;
  date_start: string;
  date_end?: string;
  country_name?: string;
  location?: string;
  year?: number;
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

const names = ["Practice 1", "Practice 2", "Practice 3"] as const;

async function jsonOrNull(response: Response) {
  if (!response.ok) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const type = Number(new URL(request.url).searchParams.get("type") ?? "1");

  if (![1, 2, 3].includes(type)) {
    return Response.json({ error: "type must be 1, 2, or 3" }, { status: 400 });
  }

  try {
    const sessionsResponse = await fetch(
      "https://api.openf1.org/v1/sessions?year=2026",
      { cache: "no-store" }
    );

    let sessions = (await jsonOrNull(sessionsResponse)) as Session[] | null;

    // OpenF1 can reject year-filtered requests. Fall back to the full list,
    // but only if the filtered request itself failed.
    if (!Array.isArray(sessions)) {
      const fallbackResponse = await fetch(
        "https://api.openf1.org/v1/sessions",
        { cache: "no-store" }
      );
      sessions = (await jsonOrNull(fallbackResponse)) as Session[] | null;
    }

    if (!Array.isArray(sessions)) {
      return Response.json(
        { error: "OpenF1 sessions unavailable" },
        { status: 502 }
      );
    }

    const target = names[type - 1];

    const candidates = sessions
      .filter(
        (session) =>
          session.session_name === target &&
          (session.year ?? 0) >= 2025 &&
          !session.is_cancelled &&
          new Date(session.date_start).getTime() <= Date.now()
      )
      .sort(
        (a, b) =>
          new Date(b.date_start).getTime() -
          new Date(a.date_start).getTime()
      );

    // Usually the first candidate has data. Only probe a few recent
    // sessions so one broken/empty OpenF1 session cannot make the page slow.
    for (const session of candidates.slice(0, 6)) {
      const resultsResponse = await fetch(
        "https://api.openf1.org/v1/session_result?session_key=" +
          session.session_key,
        { cache: "no-store" }
      );

      const resultData = (await jsonOrNull(resultsResponse)) as Result[] | null;

      if (!Array.isArray(resultData) || resultData.length === 0) continue;

      const results = resultData
        .filter((result) => Number.isFinite(result.position))
        .sort((a, b) => a.position - b.position);

      if (results.length === 0) continue;

      const driversResponse = await fetch(
        "https://api.openf1.org/v1/drivers?session_key=" +
          session.session_key,
        { cache: "no-store" }
      );

      const driverData = (await jsonOrNull(driversResponse)) as Driver[] | null;
      const drivers = Array.isArray(driverData) ? driverData : [];

      return Response.json({
        session: {
          session_key: session.session_key,
          session_name: session.session_name,
          date_start: session.date_start,
          date_end: session.date_end,
          country_name: session.country_name,
          location: session.location,
          year: session.year,
        },
        results: results.map((result) => {
          const driver = drivers.find(
            (item) => item.driver_number === result.driver_number
          );

          return {
            ...result,
            full_name:
              driver?.full_name ?? "Driver #" + result.driver_number,
            team_name: driver?.team_name ?? "Unknown Team",
          };
        }),
      });
    }

    return Response.json({ session: null, results: [] });
  } catch (error) {
    console.error("Practice API error:", error);
    return Response.json(
      { error: "Failed to load practice data" },
      { status: 500 }
    );
  }
}
