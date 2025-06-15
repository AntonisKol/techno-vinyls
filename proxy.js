require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN;
const PORT = process.env.PORT || 4000;

app.get("/api/discogs/database/search", async (req, res) => {
  try {
    const queryString = new URLSearchParams(req.query).toString();
    const url = `https://api.discogs.com/database/search?${queryString}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "YourAppName/1.0",
        Authorization: `Discogs token=${DISCOGS_TOKEN}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Discogs API error" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
