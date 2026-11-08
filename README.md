# Techno Vinyls

A Discogs-powered browser for vinyl releases tagged **only** with the `Techno`
style. Browse the newest releases, search by artist, see artwork, catalogue
numbers and Discogs' current lowest listed price, and open a release on Discogs.

Live at **<https://adnsaudio.com/techno-vinyls/>**, part of
[ADNS Audio](https://adnsaudio.com/).

## What the list shows

Vinyl releases in Discogs' Electronic genre whose only style is Techno, newest
first. Releases that also carry another style (say Techno and House) are left
out, and artist search uses the same filter. Pages hold twelve releases; the
next Discogs page loads on its own when a page runs out. Discogs search reaches
the newest 10,000 results of a query, even when it reports more.

Discogs sorts its search by year only, so within a year its order says nothing
about the date. The main list therefore comes from a release index built each
night (`scripts/build-index.mjs`): every exact match among the newest 10,000
results with its full release date, newest first, so each page is older than
the one before. Releases added to Discogs during the day appear the next
morning; prices are always live. Artist search (and the main list when there
is no index, as on local runs) uses Discogs search, and each page is put in
date order as its cards load their dates.

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
npm run test:scripts
npm run build
```

## How it is hosted

The releases render directly on the Techno Vinyls page of adnsaudio.com: the
app finds `#techno-vinyls` there and shows only the list under the page's own
heading. `npm run publish:site -- <path to the website repository>` builds it
(`/techno-vinyls/app/static/`) and points the page at the new files. Nothing
secret goes into the build: the hosted app calls the Discogs API straight from the visitor's
browser, without a token. Discogs limits requests by IP address, so every
visitor gets their own limit (25 a minute) instead of sharing one. A proxy on
shared cloud addresses was tried and dropped: other users of those addresses
used up the limit. The build is published with the ADNS Audio website.

Each card looks up its price separately, so the app paces its own requests
(`src/api/rateLimiter.ts`): at most 22 a minute in the hosted app (55 locally
with a token), searches ahead of price lookups, and one retry a minute later if
Discogs refuses anyway. Paging quickly shows the cards at once; their prices
fill in as the limit allows.

## CI and deploys

[GitHub Actions](.github/workflows/ci.yml) runs the tests, the publish-script
tests, the type check and the build on each pull request and each push to
`main`. After a push to `main` passes, it publishes the site build to
adnsaudio.com: it runs `npm run publish:site` into the website repository
(`AntonisKol/adnsaudio.com`) and pushes there, and GitHub Pages serves the new
page a minute or two later. It pushes nothing when the build hasn't changed.

The push uses a deploy key with write access to the website repository only.
Its public half is a deploy key on `AntonisKol/adnsaudio.com` (Settings → Deploy
keys, "Allow write access"), and its private half is the `SITE_DEPLOY_KEY`
secret here (Settings → Secrets and variables → Actions). The website's
"Protect main" ruleset lets deploy keys push to `main` without a pull request
(Settings → Rules → Rulesets → Bypass list → Deploy keys); everyone else still
needs one, and its "No force-push" ruleset has no exceptions. Without the secret
the deploy job stops with an error saying so. To set it up or replace it:

```sh
ssh-keygen -t ed25519 -N "" -C "techno-vinyls deploy" -f deploy_key
gh repo deploy-key add deploy_key.pub --repo AntonisKol/adnsaudio.com --allow-write --title "techno-vinyls CI deploy"
gh secret set SITE_DEPLOY_KEY --repo AntonisKol/techno-vinyls < deploy_key
rm deploy_key deploy_key.pub
```

[Another workflow](.github/workflows/index.yml) builds the release index at
03:30 UTC (or when started by hand under Actions → Release index) and pushes
it to `techno-vinyls/data/releases.json` on the website, the same way. It
needs a Discogs personal token (discogs.com/settings/developers) as the
`DISCOGS_TOKEN` secret: with one, Discogs allows 60 requests a minute, counted
per token rather than per address. The first run dates about 2,000 releases
in about 40 minutes; after that, dates already in the index are reused, so a
night takes a few minutes. To try it locally:

```sh
DISCOGS_TOKEN=… node scripts/build-index.mjs build/releases.json
```

The actions the workflows use are pinned to exact commits, and
[Dependabot](.github/dependabot.yml) proposes their updates as pull requests.

## Built with

React, TypeScript, MUI and RTK Query, on data from the
[Discogs API](https://www.discogs.com/developers). This app uses Discogs' API
but is not affiliated with, sponsored or endorsed by Discogs.

© Antonios Kolovos. All rights reserved.
