# Techno Vinyls

A Discogs-powered release browser for vinyl tagged exclusively with the
`Techno` style. Browse recent releases, search by artist, view available release
artwork, compare catalogue numbers and Discogs' current lowest listed prices,
and open the release on Discogs.

## Run locally

Install dependencies with `npm ci`. Discogs reads work without a token; you can
optionally set `DISCOGS_TOKEN` in `.env` to authenticate requests and get the
higher authenticated API rate limit. Start the proxy and React app together
with `npm start`:

- React app: <http://localhost:3000>
- Discogs proxy: <http://localhost:4000>

The artist search starts after two characters. Results are filtered to remove
cross-genre styles, shown twelve at a time, and can be browsed across Discogs
search pages. The page indicator shows the current app page; Discogs' total
search count includes mixed-style results that this app filters out. Discogs
allows browsing at most 100 pages (10,000 results) per query, even when its
reported match count is larger.

The proxy caches search results for 15 minutes and release details for 5 minutes
to reduce repeated Discogs requests. For a hosted deployment, keep the optional
`DISCOGS_TOKEN` on the server that runs the proxy; never expose it in browser
code or a static site's public environment.

## Verify

- `npm test -- --watchAll=false --runInBand`
- `npm run build`
