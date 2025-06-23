import { ReleaseSummary } from "./types/release";

/**
 * Filters only releases that are strictly "Techno" (no fusion genres).
 */
export const filterStrictlyTechnoReleases = (
  releases: ReleaseSummary[]
): ReleaseSummary[] => {
  return releases.filter((release) => {
    if (!Array.isArray(release.style)) return false;
    if (!release.style.includes("Techno")) return false;
    return release.style.every((style) => style === "Techno");
  });
};
