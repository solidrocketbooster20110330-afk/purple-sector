export type GrandPrix = {
  season: string;
  round: string;
  raceName: string;
  date?: string;
  time?: string;
  Circuit?: {
    circuitName?: string;
    Location?: {
      locality?: string;
      country?: string;
    };
  };
  Sprint?: { date: string; time?: string };
  SprintQualifying?: { date: string; time?: string };
  FirstPractice?: { date: string; time?: string };
  SecondPractice?: { date: string; time?: string };
  ThirdPractice?: { date: string; time?: string };
  Qualifying?: { date: string; time?: string };
};

export const SELECTED_GP_KEY = "selectedGrandPrix";

export async function fetchGrandPrix(): Promise<GrandPrix[]> {
  const response = await fetch(
    "https://api.jolpi.ca/ergast/f1/current.json",
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to load Grand Prix list");
  }

  const data = await response.json();
  return data?.MRData?.RaceTable?.Races ?? [];
}

function scheduleTime(
  session?: { date: string; time?: string } | null
) {
  if (!session?.date) return Number.NaN;
  return new Date(
    `${session.date}T${session.time ?? "00:00:00Z"}`
  ).getTime();
}

function raceStartTime(race: GrandPrix) {
  return race.time
    ? scheduleTime({ date: race.date ?? "", time: race.time })
    : scheduleTime(race.date ? { date: race.date } : null);
}

function weekendStartTime(race: GrandPrix) {
  const times = [
    scheduleTime(race.FirstPractice),
    scheduleTime(race.SprintQualifying),
    scheduleTime(race.SecondPractice),
    scheduleTime(race.ThirdPractice),
    scheduleTime(race.Qualifying),
    scheduleTime(race.Sprint),
    raceStartTime(race),
  ].filter(Number.isFinite);

  return times.length ? Math.min(...times) : Number.NaN;
}

export function getRelevantGrandPrix(
  races: GrandPrix[],
  nowMs = Date.now()
) {
  if (!races.length) return null;

  const ongoing = races
    .filter((race) => {
      const start = weekendStartTime(race);
      const raceStart = raceStartTime(race);
      return (
        Number.isFinite(start) &&
        Number.isFinite(raceStart) &&
        nowMs >= start &&
        nowMs <= raceStart + 24 * 60 * 60 * 1000
      );
    })
    .sort((a, b) => raceStartTime(b) - raceStartTime(a))[0];

  if (ongoing) return ongoing;

  const completed = races
    .filter((race) => {
      const raceStart = raceStartTime(race);
      return Number.isFinite(raceStart) && raceStart <= nowMs;
    })
    .sort((a, b) => raceStartTime(b) - raceStartTime(a));

  return completed[0] ?? races[0] ?? null;
}

export function getLatestGrandPrix(races: GrandPrix[]) {
  return getRelevantGrandPrix(races);
}

export function getStoredGrandPrixRound() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SELECTED_GP_KEY);
}

export function storeGrandPrix(round: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SELECTED_GP_KEY, round);
  }
}

export function getGrandPrixByRound(races: GrandPrix[], round: string | null) {
  return races.find((race) => race.round === round) ?? null;
}

export function hasSprintWeekend(race: GrandPrix | null) {
  return Boolean(race?.Sprint || race?.SprintQualifying);
}

export function getWeekendSessionName(
  race: GrandPrix | null,
  regularSession: "Practice 2" | "Practice 3"
) {
  if (!race) return regularSession;
  if (hasSprintWeekend(race)) {
    return regularSession === "Practice 2"
      ? "Sprint Qualifying"
      : "Sprint";
  }
  return regularSession;
}

export function getSessionSchedule(
  race: GrandPrix | null,
  sessionName: string
) {
  if (!race) return null;

  switch (sessionName) {
    case "Practice 1":
      return race.FirstPractice ?? null;
    case "Practice 2":
      return race.SecondPractice ?? null;
    case "Practice 3":
      return race.ThirdPractice ?? null;
    case "Sprint Qualifying":
      return race.SprintQualifying ?? null;
    case "Sprint":
      return race.Sprint ?? null;
    case "Qualifying":
      return race.Qualifying ?? null;
    case "Race":
      return race.date
        ? { date: race.date, time: race.time }
        : null;
    default:
      return null;
  }
}

export function getSessionTargetTime(
  race: GrandPrix | null,
  sessionName: string
) {
  return scheduleTime(getSessionSchedule(race, sessionName));
}
