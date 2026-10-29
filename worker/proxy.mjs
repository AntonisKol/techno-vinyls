// Discogs proxy for the hosted Techno Vinyls app, run as a Cloudflare Worker at
// api.adnsaudio.com. It forwards only the two reads the app makes, adds the
// Discogs token from the DISCOGS_TOKEN secret, and caches responses at the edge.

const DISCOGS = "https://api.discogs.com/";
const PREFIX = "/api/discogs/";
const USER_AGENT = "TechnoVinyls/1.0 (+https://adnsaudio.com/techno-vinyls/)";

export const ALLOWED_ORIGINS = [
  "https://adnsaudio.com",
  "https://www.adnsaudio.com",
  "http://localhost:3000",
];

// Search parameters the app sends; anything else is dropped, so the proxy
// can't be used for other Discogs queries.
const SEARCH_PARAMS = [
  "artist",
  "format",
  "genre",
  "style",
  "type",
  "sort",
  "sort_order",
  "page",
  "per_page",
];

const SEARCH_TTL = 15 * 60;
const RELEASE_TTL = 5 * 60;

const corsHeaders = (origin) =>
  ALLOWED_ORIGINS.includes(origin)
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        Vary: "Origin",
      }
    : {};

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

// The Discogs URL for an allowed request, or null.
export const upstreamUrl = (requestUrl) => {
  const url = new URL(requestUrl);
  if (!url.pathname.startsWith(PREFIX)) return null;
  const path = url.pathname.slice(PREFIX.length);

  if (/^releases\/\d+$/.test(path)) return { url: DISCOGS + path, ttl: RELEASE_TTL };
  if (path !== "database/search") return null;

  const params = new URLSearchParams();
  for (const name of SEARCH_PARAMS) {
    const value = url.searchParams.get(name);
    if (value !== null) params.set(name, value);
  }
  const perPage = Number(params.get("per_page") ?? 50);
  if (!Number.isInteger(perPage) || perPage < 1 || perPage > 100) return null;
  params.sort();
  return { url: `${DISCOGS}database/search?${params}`, ttl: SEARCH_TTL };
};

export const handle = async (request, env, deps) => {
  const origin = request.headers.get("Origin") ?? "";
  const cors = corsHeaders(origin);

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "GET") return json(405, { error: "Only GET" }, cors);

  const target = upstreamUrl(request.url);
  if (!target) return json(404, { error: "Not available through this proxy" }, cors);

  const cacheKey = new Request(target.url);
  const cached = await deps.cache.match(cacheKey);
  if (cached) return withHeaders(cached, cors);

  const headers = { "User-Agent": USER_AGENT };
  if (env.DISCOGS_TOKEN) headers.Authorization = `Discogs token=${env.DISCOGS_TOKEN}`;

  let response;
  try {
    response = await deps.fetch(target.url, { headers });
  } catch {
    return json(502, { error: "Could not reach Discogs" }, cors);
  }

  const body = await response.text();
  const result = new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      ...(response.ok ? { "Cache-Control": `public, max-age=${target.ttl}` } : {}),
    },
  });
  if (response.ok) deps.waitUntil(deps.cache.put(cacheKey, result.clone()));
  return withHeaders(result, cors);
};

const withHeaders = (response, extra) => {
  const copy = new Response(response.body, response);
  for (const [name, value] of Object.entries(extra)) copy.headers.set(name, value);
  return copy;
};

export default {
  fetch: (request, env, ctx) =>
    handle(request, env, {
      fetch,
      cache: caches.default,
      waitUntil: (promise) => ctx.waitUntil(promise),
    }),
};
