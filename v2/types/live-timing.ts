export type DataFreshness = "live" | "delayed" | "cached" | "stale" | "unavailable";

export type SessionStatus =
  | "scheduled"
  | "green"
  | "yellow"
  | "red"
  | "safety-car"
  | "virtual-safety-car"
  | "chequered"
  | "finished"
  | "unknown";

export type SectorStatus = "purple" | "green" | "yellow" | "none" | "unknown";

export interface SessionSnapshot {
  sessionId: string;
  meetingName: string;
  sessionName: string;
  circuitName: string;
  status: SessionStatus;
  remainingSeconds: number | null;
  sourceTimestamp: string | null;
  freshness: DataFreshness;
}

export interface SectorTime {
  valueSeconds: number | null;
  status: SectorStatus;
}

export interface DriverTiming {
  driverId: string;
  driverNumber: number | null;
  acronym: string;
  fullName: string;
  teamName: string;
  position: number | null;
  gapToLeaderSeconds: number | null;
  intervalSeconds: number | null;
  lastLapSeconds: number | null;
  bestLapSeconds: number | null;
  sectors: [SectorTime, SectorTime, SectorTime];
  pitStatus: "pit-lane" | "on-track" | "unknown";
  sourceTimestamp: string | null;
}

export interface LiveTimingPayload {
  session: SessionSnapshot;
  drivers: DriverTiming[];
  updatedAt: string;
  freshness: DataFreshness;
  warnings: string[];
}
