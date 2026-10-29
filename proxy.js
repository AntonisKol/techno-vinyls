require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN;
const PORT = process.env.PORT || 4000;

app.get("/api/discogs/*", async (req, res) => {
  const path = req.params[0];
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
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(502).json({ error: "Could not reach Discogs" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
