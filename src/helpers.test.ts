import { filterStrictlyTechnoReleases } from "./helpers";
import { ReleaseSummary } from "./types/release";

const release = (style: string[]): ReleaseSummary => ({
  id: 1,
  title: "Test release",
  format: ["Vinyl", '12"'],
  year: 2026,
  genre: ["Electronic"],
  style,
});

describe("filterStrictlyTechnoReleases", () => {
  it("keeps releases tagged only as Techno", () => {
    expect(filterStrictlyTechnoReleases([release(["Techno"])]))
      .toHaveLength(1);
  });

  it("excludes cross-genre and untagged releases", () => {
    const mixed = release(["Techno", "Dub Techno"]);
    const untagged = release([]);

    expect(filterStrictlyTechnoReleases([mixed, untagged])).toHaveLength(0);
  });

  it("excludes releases that are not vinyl", () => {
    const digital = { ...release(["Techno"]), format: ["File"] };

    expect(filterStrictlyTechnoReleases([digital])).toHaveLength(0);
  });
});
