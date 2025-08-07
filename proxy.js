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

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "YourAppName/1.0",
        Authorization: `Discogs token=${DISCOGS_TOKEN}`,
      },
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (err) {
      console.error(`JSON parse failed for ${req.url}`, err);
      res.status(502).json({ error: "Invalid JSON from Discogs" });
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
