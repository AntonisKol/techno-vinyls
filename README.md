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
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

## How it is hosted

`npm run build:site` builds for `/techno-vinyls/app/` and copies nothing
secret: the hosted app calls the Discogs API straight from the visitor's
browser, without a token. Discogs limits requests by IP address, so every
visitor gets their own limit (25 a minute) instead of sharing one. A proxy on
shared cloud addresses was tried and dropped: other users of those addresses
used up the limit. The build is published with the ADNS Audio website.

Each card looks up its price separately, so the app paces its own requests
(`src/api/rateLimiter.ts`): at most 22 a minute in the hosted app (55 locally
with a token), searches ahead of price lookups, and one retry a minute later if
Discogs refuses anyway. Paging quickly shows the cards at once; their prices
fill in as the limit allows.

## Built with

React, TypeScript, MUI and RTK Query, on data from the
[Discogs API](https://www.discogs.com/developers). This app uses Discogs' API
but is not affiliated with, sponsored or endorsed by Discogs.

© Antonios Kolovos. All rights reserved.
