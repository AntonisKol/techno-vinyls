import { filterStrictlyTechnoReleases, sortNewestFirst } from "./helpers";
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

describe("sortNewestFirst", () => {
  const withId = (id: number, year: number | string = 2026) => ({
    ...release(["Techno"]),
    id,
    year,
  });

  it("orders by full release date, newest first", () => {
    const sorted = sortNewestFirst([withId(1), withId(2), withId(3)], {
      1: "2026-03-02",
      2: "2026-10-12",
      3: "2026-08-07",
    });

    expect(sorted.map(({ id }) => id)).toEqual([2, 3, 1]);
  });

  it("puts a known month before the unknown day or month of that year", () => {
    const sorted = sortNewestFirst([withId(1), withId(2), withId(3)], {
      1: "2026",
      2: "2026-00-00",
      3: "2026-05-00",
    });

    expect(sorted.map(({ id }) => id)).toEqual([3, 1, 2]);
  });

  it("falls back to the year, and keeps Discogs' order for equal dates", () => {
    const sorted = sortNewestFirst(
      [withId(1), withId(2), withId(3, 2025), withId(4)],
      { 4: "2026-01-15" }
    );

    expect(sorted.map(({ id }) => id)).toEqual([4, 1, 2, 3]);
  });
});
