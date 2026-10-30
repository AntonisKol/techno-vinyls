import { DETAILS_TTL, storedBaseQuery } from "./storedBaseQuery";

const api = {} as never;

const details = {
  id: 7,
  title: "Tar 40",
  year: 2026,
  released_formatted: "09 Jan 2026",
  labels: [{ name: "Tar Hallow", catno: "TAR040", entity_type: "1" }],
  images: [{ type: "primary", uri: "https://images.example/7.jpg" }],
  tracklist: [{ title: "A1" }],
};

describe("storedBaseQuery", () => {
  beforeEach(() => window.localStorage.clear());

  it("answers a release from storage until it is a day old", async () => {
    let time = 0;
    const base = jest.fn().mockResolvedValue({ data: details });
    const query = storedBaseQuery(base, window.localStorage, () => time);

    await query("releases/7", api, {});
    time = DETAILS_TTL - 1;
    const stored = await query("releases/7", api, {});

    expect(base).toHaveBeenCalledTimes(1);
    expect(stored).toEqual({
      data: expect.objectContaining({
        released_formatted: "09 Jan 2026",
        labels: [{ name: "Tar Hallow", catno: "TAR040" }],
      }),
    });
    expect(stored.data).not.toHaveProperty("tracklist");

    time = DETAILS_TTL;
    await query("releases/7", api, {});
    expect(base).toHaveBeenCalledTimes(2);
  });

  it("never stores prices or searches", async () => {
    const base = jest.fn().mockResolvedValue({ data: { num_for_sale: 3 } });
    const query = storedBaseQuery(base, window.localStorage);

    await query("marketplace/stats/7?curr_abbr=EUR", api, {});
    await query("marketplace/stats/7?curr_abbr=EUR", api, {});
    await query("database/search?style=Techno", api, {});
    await query("database/search?style=Techno", api, {});

    expect(base).toHaveBeenCalledTimes(4);
    expect(window.localStorage.length).toBe(0);
  });

  it("doesn't store refused requests", async () => {
    const base = jest
      .fn()
      .mockResolvedValueOnce({ error: { status: 429 } })
      .mockResolvedValueOnce({ data: details });
    const query = storedBaseQuery(base, window.localStorage);

    await query("releases/7", api, {});
    await expect(query("releases/7", api, {})).resolves.toEqual({
      data: details,
    });
    expect(base).toHaveBeenCalledTimes(2);
  });

  it("still works when the browser blocks storage", async () => {
    const base = jest.fn().mockResolvedValue({ data: details });
    const query = storedBaseQuery(base, null);

    await expect(query("releases/7", api, {})).resolves.toEqual({
      data: details,
    });
  });
});
