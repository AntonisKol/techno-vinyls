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
cross-genre styles, shown ten at a time, and can be loaded across additional
Discogs pages.

## Verify

- `npm test -- --watchAll=false --runInBand`
- `npm run build`
