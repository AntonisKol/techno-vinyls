# Techno Vinyls

A Discogs-powered browser for vinyl releases tagged **only** with the `Techno`
style. Browse the newest releases, search by artist, see artwork, catalogue
numbers and Discogs' current lowest listed price, and open a release on Discogs.

Live at **<https://adnsaudio.com/techno-vinyls/app/>**, part of
[ADNS Audio](https://adnsaudio.com/).

## What the list shows

Vinyl releases in Discogs' Electronic genre whose only style is Techno, newest
first. Releases that also carry another style (say Techno and House) are left
out, and artist search uses the same filter. Pages hold twelve releases; the
next Discogs page loads on its own when a page runs out. Discogs search reaches
the newest 10,000 results of a query, even when it reports more.

## Run locally

```sh
npm ci
cp .env.example .env   # optional: add a Discogs token for the higher rate limit
npm start
```

- App: <http://localhost:3000>
- Discogs proxy (`proxy.js`): <http://localhost:4000>

Discogs reads work without a token. With one, keep it in `.env`, which git
ignores. Never put it in browser code.

## Test

```sh
CI=true npm test -- --watchAll=false --runInBand   # the app (Jest)
npm run test:worker                                 # the hosted proxy (node:test)
npm run build
```

## How it is hosted

- **App:** `npm run build:site` builds for `/techno-vinyls/app/` with the API
  address `https://api.adnsaudio.com/api/discogs/`. The build is published with
  the ADNS Audio website.
- **Proxy:** [`worker/proxy.mjs`](worker/proxy.mjs) is a Cloudflare Worker at
  `api.adnsaudio.com`. It forwards only the two Discogs reads the app makes
  (search and release details), adds the token from a Worker secret, caches
  results (search 15 minutes, releases 5 minutes) and answers browsers only
  from adnsaudio.com and localhost.

```sh
npx wrangler login
npx wrangler secret put DISCOGS_TOKEN --config worker/wrangler.toml
npm run deploy:worker
```

## Built with

React, TypeScript, MUI and RTK Query, on data from the
[Discogs API](https://www.discogs.com/developers). This app uses Discogs' API
but is not affiliated with, sponsored or endorsed by Discogs.

© Antonios Kolovos. All rights reserved.
