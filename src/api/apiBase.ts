// The hosted build points this at the Cloudflare Worker (see worker/);
// local runs use proxy.js on port 4000.
export const LOCAL_API_BASE = "http://localhost:4000/api/discogs/";

export const apiBase = (configured = process.env.REACT_APP_API_BASE) =>
  configured ? configured.replace(/\/?$/, "/") : LOCAL_API_BASE;
