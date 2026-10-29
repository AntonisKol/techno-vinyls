import { apiBase, LOCAL_API_BASE } from "./apiBase";

describe("apiBase", () => {
  it("uses the address the hosted build sets", () => {
    expect(apiBase("https://api.adnsaudio.com/api/discogs/")).toBe(
      "https://api.adnsaudio.com/api/discogs/"
    );
  });

  it("adds the trailing slash the endpoint paths need", () => {
    expect(apiBase("https://api.adnsaudio.com/api/discogs")).toBe(
      "https://api.adnsaudio.com/api/discogs/"
    );
  });

  it("falls back to proxy.js on localhost", () => {
    expect(apiBase(undefined)).toBe(LOCAL_API_BASE);
    expect(apiBase("")).toBe(LOCAL_API_BASE);
  });
});
