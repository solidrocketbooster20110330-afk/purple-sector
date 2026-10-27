const teamAliases: Array<[string, string]> = [
  ["racing bulls", "racing-bulls"], ["visa cash app rb", "racing-bulls"],
  ["red bull", "red-bull"], ["mclaren", "mclaren"], ["mercedes", "mercedes"],
  ["ferrari", "ferrari"], ["williams", "williams"], ["aston martin", "aston-martin"],
  ["alpine", "alpine"], ["haas", "haas"], ["audi", "audi"], ["cadillac", "cadillac"],
];

export function teamSlug(teamName: string): string | null {
  const normalized = teamName.toLowerCase();
  return teamAliases.find(([alias]) => normalized.includes(alias))?.[1] ?? null;
}

export function getTeamCarImage(teamName: string): string | null {
  const slug = teamSlug(teamName);
  return slug ? `/images/teams/${slug}.webp` : null;
}

export function getTeamPortraits(teamName: string): string[] {
  const slug = teamSlug(teamName);
  if (!slug) return [];
  const count = slug === "red-bull" || slug === "racing-bulls" ? 3 : 2;
  return Array.from({ length: count }, (_, index) => `/images/drivers/${slug}-${String(index + 1).padStart(2, "0")}.webp`);
}
