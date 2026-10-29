require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN;
const PORT = process.env.PORT || 4000;
const responseCache = new Map();
const MAX_CACHE_ENTRIES = 500;
const SEARCH_CACHE_TTL = 15 * 60 * 1000;
const RELEASE_CACHE_TTL = 5 * 60 * 1000;

const cacheDurationFor = (path) =>
  path.startsWith("database/search") ? SEARCH_CACHE_TTL : RELEASE_CACHE_TTL;

app.get("/api/discogs/*", async (req, res) => {
  const path = req.params[0];
  const cacheKey = req.originalUrl;
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.data);
  }
  if (cached) responseCache.delete(cacheKey);

  const url = `https://api.discogs.com/${path}?${new URLSearchParams(
    req.query
  )}`;
  const headers = {
    "User-Agent": "TechnoVinyls/1.0 (Discogs release discovery app)",
  };
  if (DISCOGS_TOKEN) {
    headers.Authorization = `Discogs token=${DISCOGS_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      headers,
      timeout: 15000,
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      if (!response.ok) {
        return res.status(response.status).json({
          error: text || response.statusText || "Discogs request failed",
        });
      }
      console.error(`Invalid Discogs response for ${req.url}`, err);
      return res.status(502).json({ error: "Invalid JSON from Discogs" });
    }

    if (!response.ok) return res.status(response.status).json(data);
    if (responseCache.size >= MAX_CACHE_ENTRIES) {
      responseCache.delete(responseCache.keys().next().value);
    }
    responseCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + cacheDurationFor(path),
    });
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(502).json({ error: "Could not reach Discogs" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
