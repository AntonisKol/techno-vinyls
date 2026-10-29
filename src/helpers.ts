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
