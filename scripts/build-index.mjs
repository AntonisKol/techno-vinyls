// Builds the main list in full date order: every vinyl release in Discogs'
// Electronic genre whose only style is Techno, among the newest 10,000 search
// results (all Discogs search reaches), with its full release date, newest
// first. Discogs search sorts by year only and the browser may ask ~22 times a
// minute, so this runs nightly in CI (.github/workflows/index.yml) instead.
//
// Usage: DISCOGS_TOKEN=… node scripts/build-index.mjs <releases.json>
// Dates already in <releases.json> are reused, so after the first run only new
// releases cost a request.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SEARCH =
  "https://api.discogs.com/database/search?format=Vinyl&genre=Electronic&style=Techno&type=release&sort=year&sort_order=desc&per_page=100";
// Discogs search stops at page 100 of 100 results, whatever the total.
const MAX_PAGES = 100;
// 60 requests a minute with a token; stay a little under.
const PAUSE_MS = 1100;
const MAX_RETRIES = 5;

// The same filter as the app (src/helpers.ts).
export const isStrictlyTechno = (release) =>
  Array.isArray(release.format) &&
  release.format.some((format) => format.toLowerCase() === "vinyl") &&
  Array.isArray(release.style) &&
  release.style.length > 0 &&
  release.style.every((style) => style === "Techno");

// "2026" and "2026-08" sort after every full date in 2026 (as in the app).
const dateKey = (date) => {
  const [year, month = "00", day = "00"] = String(date).split("-");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export const newestFirst = (releases) =>
  [...releases].sort(
    (a, b) =>
      dateKey(b.released || b.year || "").localeCompare(
        dateKey(a.released || a.year || "")
      ) || b.id - a.id
  );

// Only what the cards show before their own details load.
const summary = (result, details) => ({
  id: result.id,
  title: result.title,
  cover_image: result.cover_image,
  thumb: result.thumb,
  format: result.format,
  year: result.year,
  genre: result.genre,
  style: result.style,
  catno: result.catno,
  released: details.released,
  released_formatted: details.released_formatted,
});

// getJson(url) returns the parsed answer, or null when Discogs has no such
// release. previous: the last index's releases, whose dates are reused.
export const buildIndex = async (getJson, previous = [], log = () => {}) => {
  const known = new Map(previous.map((release) => [release.id, release]));
  const matches = new Map();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const answer = await getJson(`${SEARCH}&page=${page}`);
    for (const result of answer.results) {
      if (isStrictlyTechno(result)) matches.set(result.id, result);
    }
    if (page >= answer.pagination.pages) break;
  }
  log(`${matches.size} exact Techno vinyl releases found`);

  const releases = [];
  let fetched = 0;
  for (const result of matches.values()) {
    const before = known.get(result.id);
    let details = before?.released ? before : null;
    if (!details) {
      details = await getJson(`https://api.discogs.com/releases/${result.id}`);
      fetched += 1;
      if (fetched % 100 === 0) log(`${fetched} release dates fetched`);
    }
    if (details) releases.push(summary(result, details));
  }
  log(`${fetched} release dates fetched, ${releases.length - fetched} reused`);
  return newestFirst(releases);
};

// One release a line and no timestamp, so a night without new releases
// changes nothing, and the website's history grows by the new lines only.
export const serialize = (releases) =>
  `{"releases": [\n${releases
    .map((release) => JSON.stringify(release))
    .join(",\n")}\n]}\n`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const discogs = (token) => async (url) => {
  for (let attempt = 0; ; attempt += 1) {
    await sleep(PAUSE_MS);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "TechnoVinyls/1.0 (Discogs release discovery app)",
        Authorization: `Discogs token=${token}`,
      },
    });
    if (response.ok) return response.json();
    if (response.status === 404) return null;
    if (
      attempt === MAX_RETRIES ||
      (response.status < 500 && response.status !== 429)
    ) {
      throw new Error(`Discogs answered ${response.status} for ${url}`);
    }
    // Refused or failing: wait a full minute, then try again.
    await sleep(60_000);
  }
};

const main = async (file) => {
  const token = process.env.DISCOGS_TOKEN;
  if (!token) throw new Error("DISCOGS_TOKEN is not set.");
  const previous = existsSync(file)
    ? JSON.parse(readFileSync(file, "utf8")).releases
    : [];
  const releases = await buildIndex(discogs(token), previous, console.log);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, serialize(releases));
  console.log(`Wrote ${releases.length} releases to ${file}.`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) {
    console.error("Usage: node scripts/build-index.mjs <releases.json>");
    process.exit(1);
  }
  main(process.argv[2]).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
