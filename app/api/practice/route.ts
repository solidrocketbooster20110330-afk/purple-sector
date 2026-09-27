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

const practiceNames = ["Practice 1", "Practice 2", "Practice 3"] as const;

async function readJson<T>(response: Response): Promise<T | null> {
  if (!response.ok) return null;

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchSessions(): Promise<Session[]> {
  // OpenF1 currently returns no data for the year-filtered endpoint in some
  // environments, so request the stable sessions endpoint first.
  const response = await fetch("https://api.openf1.org/v1/sessions", {
    cache: "no-store",
  });

  const data = await readJson<Session[]>(response);
  return Array.isArray(data) ? data : [];
}

export async function GET(request: Request) {
  const type = Number(new URL(request.url).searchParams.get("type") ?? "1");

  if (![1, 2, 3].includes(type)) {
    return Response.json(
      { error: "type must be 1, 2, or 3" },
      { status: 400 }
    );
  }

  try {
    const sessions = await fetchSessions();
    const target = practiceNames[type - 1];

    const candidates = sessions
      .filter((session) => {
        const start = new Date(session.date_start).getTime();

        return (
          session.session_name === target &&
          !session.is_cancelled &&
          Number.isFinite(start) &&
          start <= Date.now()
        );
      })
      .sort(
        (a, b) =>
          new Date(b.date_start).getTime() -
          new Date(a.date_start).getTime()
      );

    // Check only the most recent completed sessions. This avoids the slow
    // chain of requests that happened when many old/empty sessions existed.
    for (const session of candidates.slice(0, 8)) {
      const resultResponse = await fetch(
        `https://api.openf1.org/v1/session_result?session_key=${session.session_key}`,
        { cache: "no-store" }
      );

      const resultData = await readJson<Result[]>(resultResponse);

      if (!Array.isArray(resultData)) continue;

      const results = resultData
        .filter(
          (result) =>
            Number.isFinite(result.position) &&
            Number.isFinite(result.driver_number)
        )
        .sort((a, b) => a.position - b.position);

      if (results.length === 0) continue;

      const driverResponse = await fetch(
        `https://api.openf1.org/v1/drivers?session_key=${session.session_key}`,
        { cache: "no-store" }
      );

      const driverData = await readJson<Driver[]>(driverResponse);
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
              driver?.full_name ?? `Driver #${result.driver_number}`,
            team_name: driver?.team_name ?? "Unknown Team",
          };
        }),
      });
    }

    return Response.json({
      session: null,
      results: [],
      message: `${target} 결과를 찾지 못했습니다.`,
    });
  } catch (error) {
    console.error("Practice API error:", error);

    return Response.json(
      { error: "Failed to load practice data" },
      { status: 500 }
    );
  }
}
