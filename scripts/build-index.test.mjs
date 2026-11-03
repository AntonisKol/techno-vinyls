import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildIndex,
  isStrictlyTechno,
  newestFirst,
  serialize,
} from "./build-index.mjs";

const result = (id, style = ["Techno"], format = ["Vinyl", '12"']) => ({
  id,
  title: `Release ${id}`,
  format,
  year: "2026",
  genre: ["Electronic"],
  style,
});

const page = (results, pages = 1, number = 1) => ({
  pagination: { page: number, pages },
  results,
});

// A fake Discogs: search pages in order, and release details by id.
const fakeDiscogs = (pages, dates) => {
  const asked = [];
  const getJson = async (url) => {
    asked.push(url);
    const search = url.match(/database\/search.*page=(\d+)$/);
    if (search) return pages[Number(search[1]) - 1];
    const id = Number(url.match(/releases\/(\d+)$/)[1]);
    return id in dates ? { released: dates[id] } : null;
  };
  return { getJson, asked };
};

test("keeps vinyl releases whose only style is Techno", () => {
  assert.equal(isStrictlyTechno(result(1)), true);
  assert.equal(isStrictlyTechno(result(2, ["Techno", "House"])), false);
  assert.equal(isStrictlyTechno(result(3, [])), false);
  assert.equal(isStrictlyTechno(result(4, ["Techno"], ["File"])), false);
});

test("orders by full date, a year or month alone after that year's dates", () => {
  const sorted = newestFirst([
    { id: 1, released: "2026" },
    { id: 2, released: "2026-03-02" },
    { id: 3, released: "2025-12-31" },
    { id: 4, released: "2026-10-12" },
    { id: 5, released: "2026-03-00" },
  ]);
  assert.deepEqual(
    sorted.map(({ id }) => id),
    [4, 2, 5, 1, 3]
  );
});

test("reads every search page, and dates each exact match newest first", async () => {
  const { getJson } = fakeDiscogs(
    [
      page([result(1), result(2, ["Techno", "House"])], 2, 1),
      page([result(3), result(1)], 2, 2),
    ],
    { 1: "2026-03-02", 3: "2026-10-12" }
  );

  const releases = await buildIndex(getJson);

  assert.deepEqual(
    releases.map(({ id, released }) => [id, released]),
    [
      [3, "2026-10-12"],
      [1, "2026-03-02"],
    ]
  );
});

test("reuses dates from the last index, and skips releases Discogs removed", async () => {
  const { getJson, asked } = fakeDiscogs(
    [page([result(1), result(2), result(3)])],
    {
      2: "2026-05-01",
    }
  );

  const releases = await buildIndex(getJson, [
    { id: 1, released: "2026-01-09", released_formatted: "09 Jan 2026" },
  ]);

  assert.deepEqual(
    asked.filter((url) => url.includes("/releases/")),
    ["https://api.discogs.com/releases/2", "https://api.discogs.com/releases/3"]
  );
  assert.deepEqual(
    releases.map(({ id, released_formatted }) => [id, released_formatted]),
    [
      [2, undefined],
      [1, "09 Jan 2026"],
    ]
  );
});

test("writes one release a line, and reads back the same", () => {
  const releases = [
    { id: 2, released: "2026-10-12" },
    { id: 1, released: "2026" },
  ];
  const text = serialize(releases);

  assert.equal(text.split("\n").length, 5);
  assert.deepEqual(JSON.parse(text).releases, releases);
});
