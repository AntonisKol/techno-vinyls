// The hosted build calls Discogs straight from the browser, so each visitor
// has their own rate limit (Discogs limits by IP); local runs use proxy.js on
// port 4000, which can add a token from .env.
export const LOCAL_API_BASE = "http://localhost:4000/api/discogs/";

export const apiBase = (configured = process.env.REACT_APP_API_BASE) =>
  configured ? configured.replace(/\/?$/, "/") : LOCAL_API_BASE;
