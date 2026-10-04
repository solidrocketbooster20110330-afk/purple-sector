export type GrandPrix = {
  season: string;
  round: string;
  raceName: string;
  date?: string;
  time?: string;
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

export function getLatestGrandPrix(races: GrandPrix[]) {
  return races[races.length - 1] ?? null;
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
