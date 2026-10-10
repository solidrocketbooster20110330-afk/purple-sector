export const teamColors: Record<string, string> = {
  McLaren: "#ff8000",
  Ferrari: "#e80020",
  "Red Bull": "#3671c6",
  "Red Bull Racing": "#3671c6",
  "Red Bull Racing F1 Team": "#3671c6",
  Mercedes: "#27f4d2",
  "Aston Martin": "#00665e",
  "Aston Martin F1 Team": "#00665e",
  "Alpine F1 Team": "#ff87bc",
  Alpine: "#ff87bc",
  Williams: "#64c4ff",
  "Racing Bulls": "#6692ff",
  "Visa Cash App RB": "#6692ff",
  "Visa Cash App Racing Bulls": "#6692ff",
  "RB F1 Team": "#6692ff",
  RB: "#6692ff",
  "Haas F1 Team": "#e6002b",
  Haas: "#e6002b",
  Audi: "#f50537",
  "Cadillac F1 Team": "#c9c9c9",
  Cadillac: "#c9c9c9",
};

const countryFlags: Record<string, string> = {
  Australia: "🇦🇺",
  China: "🇨🇳",
  Japan: "🇯🇵",
  Canada: "🇨🇦",
  Monaco: "🇲🇨",
  Austria: "🇦🇹",
  UnitedKingdom: "🇬🇧",
  Belgium: "🇧🇪",
  Hungary: "🇭🇺",
  Netherlands: "🇳🇱",
  Italy: "🇮🇹",
  Azerbaijan: "🇦🇿",
  Singapore: "🇸🇬",
  UnitedStates: "🇺🇸",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Qatar: "🇶🇦",
  "United Arab Emirates": "🇦🇪",
  Spain: "🇪🇸",
  Bahrain: "🇧🇭",
  Germany: "🇩🇪",
};

export function countryFlag(country?: string): string {
  if (!country) return "🌍";
  return countryFlags[country] ?? countryFlags[country.replace(/\s+/g, "")] ?? "🌍";
}

type RaceDateTime = { date: string; time?: string };

export function formatRaceDateKst(race: RaceDateTime): string {
  const time = race.time
    ? /(?:Z|[+-]\d{2}:\d{2})$/.test(race.time)
      ? race.time
      : `${race.time}Z`
    : "00:00:00Z";
  const dateTime = new Date(`${race.date}T${time}`);
  const dateLabel = dateTime.toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  if (!race.time) return dateLabel;

  const timeLabel = dateTime.toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dateLabel} · ${timeLabel} KST`;
}
