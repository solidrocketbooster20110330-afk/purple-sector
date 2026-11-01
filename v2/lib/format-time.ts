export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return minutes > 0
    ? `${minutes}:${remainder.toFixed(3).padStart(6, "0")}`
    : remainder.toFixed(3);
}

export function formatGap(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return "—";
  if (seconds === 0) return "LEADER";
  return `+${seconds.toFixed(3)}`;
}
