import { ReleaseSummary } from "./types/release";

export const filterStrictlyTechnoReleases = (
  releases: ReleaseSummary[]
): ReleaseSummary[] => {
  return releases.filter((release) => {
    if (!Array.isArray(release.format)) return false;
    if (!release.format.some((format) => format.toLowerCase() === "vinyl")) {
      return false;
    }
    if (!Array.isArray(release.style)) return false;
    if (!release.style.includes("Techno")) return false;
    return release.style.every((style) => style === "Techno");
  });
};

// "2026" and "2026-08" sort after every full date in 2026, as Discogs leaves
// the unknown parts out (or writes them as 00).
const dateKey = (date: string) => {
  const [year, month = "00", day = "00"] = date.split("-");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

// Newest first by full release date where it has loaded, otherwise by year;
// equal dates keep Discogs' order.
export const sortNewestFirst = (
  releases: ReleaseSummary[],
  releasedById: Record<number, string | undefined>
): ReleaseSummary[] => {
  const key = (release: ReleaseSummary) =>
    dateKey(releasedById[release.id] || String(release.year || ""));
  return [...releases].sort((a, b) => key(b).localeCompare(key(a)));
};
