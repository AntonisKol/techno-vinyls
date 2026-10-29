import { test } from "node:test";
import assert from "node:assert/strict";
import { handle, upstreamUrl } from "./proxy.mjs";

const SEARCH =
  "https://api.adnsaudio.com/api/discogs/database/search?format=Vinyl&genre=Electronic&style=Techno&type=release&sort=year&sort_order=desc&page=2&per_page=100";

// A fake Cloudflare cache and Discogs, so the handler runs in Node.
const setup = ({ status = 200, body = { results: [] }, fail = false } = {}) => {
  const store = new Map();
  const calls = [];
  const pending = [];
  return {
    calls,
    store,
    settle: () => Promise.all(pending),
    deps: {
      fetch: async (url, init) => {
        calls.push({ url, init });
        if (fail) throw new Error("offline");
        return new Response(JSON.stringify(body), { status });
      },
      cache: {
        match: async (request) => store.get(request.url)?.clone(),
        put: async (request, response) => void store.set(request.url, response),
      },
      waitUntil: (promise) => pending.push(promise),
    },
  };
};

const get = (url, origin = "https://adnsaudio.com") =>
  new Request(url, { headers: { Origin: origin } });

test("forwards the app's search with the token and the site's CORS header", async () => {
  const fake = setup({ body: { pagination: { page: 2 } } });
  const response = await handle(get(SEARCH), { DISCOGS_TOKEN: "secret" }, fake.deps);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { pagination: { page: 2 } });
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://adnsaudio.com");
  assert.equal(fake.calls.length, 1);
  assert.match(fake.calls[0].url, /^https:\/\/api\.discogs\.com\/database\/search\?/);
  assert.equal(fake.calls[0].init.headers.Authorization, "Discogs token=secret");
});

test("answers a repeated request from the cache without calling Discogs", async () => {
  const fake = setup();
  await handle(get(SEARCH), {}, fake.deps);
  await fake.settle();
  const again = await handle(get(SEARCH), {}, fake.deps);

  assert.equal(again.status, 200);
  assert.equal(fake.calls.length, 1);
  assert.equal(again.headers.get("Access-Control-Allow-Origin"), "https://adnsaudio.com");
});

test("does not cache Discogs errors such as a rate limit", async () => {
  const fake = setup({ status: 429, body: { message: "slow down" } });
  const response = await handle(get(SEARCH), {}, fake.deps);
  await fake.settle();

  assert.equal(response.status, 429);
  assert.equal(fake.store.size, 0);
});

test("only forwards the two reads the app makes", () => {
  assert.ok(upstreamUrl("https://api.adnsaudio.com/api/discogs/releases/123"));
  assert.equal(upstreamUrl("https://api.adnsaudio.com/api/discogs/users/someone/collection"), null);
  assert.equal(upstreamUrl("https://api.adnsaudio.com/api/discogs/releases/123/rating"), null);
  assert.equal(upstreamUrl("https://api.adnsaudio.com/other"), null);
  assert.equal(upstreamUrl(`${SEARCH.replace("per_page=100", "per_page=500")}`), null);
});

test("drops search parameters the app never sends", () => {
  const { url } = upstreamUrl(`${SEARCH}&token=stolen&q=anything`);
  assert.ok(!url.includes("token="));
  assert.ok(!url.includes("q="));
  assert.ok(url.includes("style=Techno"));
});

test("gives other websites no CORS header, and rejects writes", async () => {
  const fake = setup();
  const other = await handle(get(SEARCH, "https://example.com"), {}, fake.deps);
  assert.equal(other.headers.get("Access-Control-Allow-Origin"), null);

  const post = await handle(new Request(SEARCH, { method: "POST" }), {}, fake.deps);
  assert.equal(post.status, 405);
});

test("answers the browser's preflight for the site", async () => {
  const fake = setup();
  const response = await handle(
    new Request(SEARCH, { method: "OPTIONS", headers: { Origin: "http://localhost:3000" } }),
    {},
    fake.deps
  );
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "http://localhost:3000");
});

test("reports 502 when Discogs can't be reached", async () => {
  const fake = setup({ fail: true });
  const response = await handle(get(SEARCH), {}, fake.deps);
  assert.equal(response.status, 502);
});
