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

const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

// "07 Aug 2026" → "2026-08-07", "Mar 2026" → "2026-03", "2026" → "2026":
// details stored in the browser before the sortable date was kept have only
// Discogs' date text.
export const dateFromFormatted = (formatted?: string) => {
  const parts = formatted?.trim().split(/\s+/) ?? [];
  const year = parts.pop();
  if (!year || !/^\d{4}$/.test(year)) return undefined;
  const month = MONTHS.indexOf(parts.pop() ?? "") + 1;
  const day = parts.pop();
  if (!month) return year;
  const mm = String(month).padStart(2, "0");
  return day && /^\d{1,2}$/.test(day)
    ? `${year}-${mm}-${day}`
    : `${year}-${mm}`;
};

// "2026" and "2026-08" sort after every full date in 2026, as Discogs leaves
// the unknown parts out (or writes them as 00).
const dateKey = (date: string) => {
  const [year, month = "00", day = "00"] = date.split("-");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

// Newest first by full release date where it has loaded (or the index has
// it), otherwise by year;
// equal dates keep Discogs' order.
export const sortNewestFirst = (
  releases: ReleaseSummary[],
  releasedById: Record<number, string | undefined>
): ReleaseSummary[] => {
  const key = (release: ReleaseSummary) =>
    dateKey(
      releasedById[release.id] || release.released || String(release.year || "")
    );
  return [...releases].sort((a, b) => key(b).localeCompare(key(a)));
};
