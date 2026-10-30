import { MAX_RETRIES, throttledBaseQuery } from "./throttledBaseQuery";

const limiter = () => ({
  schedule: jest.fn().mockResolvedValue(undefined),
  backOff: jest.fn(),
});

const api = {} as never;

describe("throttledBaseQuery", () => {
  it("waits for the limiter, with searches ahead of release details", async () => {
    const fakeLimiter = limiter();
    const base = jest.fn().mockResolvedValue({ data: {} });
    const query = throttledBaseQuery(fakeLimiter, base);

    await query("database/search?style=Techno", api, {});
    await query("releases/7", api, {});

    expect(fakeLimiter.schedule.mock.calls).toEqual([[0], [1]]);
    expect(base).toHaveBeenCalledTimes(2);
  });

  it("keeps trying after several refusals in a row", async () => {
    const fakeLimiter = limiter();
    const base = jest
      .fn()
      .mockResolvedValueOnce({ error: { status: "FETCH_ERROR" } })
      .mockResolvedValueOnce({ error: { status: 429 } })
      .mockResolvedValueOnce({ error: { status: "FETCH_ERROR" } })
      .mockResolvedValueOnce({ data: { id: 7 } });
    const query = throttledBaseQuery(fakeLimiter, base);

    await expect(query("releases/7", api, {})).resolves.toEqual({
      data: { id: 7 },
    });
    expect(fakeLimiter.backOff).toHaveBeenCalledTimes(3);
  });

  it("backs off and tries once more when Discogs refuses", async () => {
    const fakeLimiter = limiter();
    const base = jest
      .fn()
      .mockResolvedValueOnce({ error: { status: "FETCH_ERROR" } })
      .mockResolvedValueOnce({ data: { id: 7 } });
    const query = throttledBaseQuery(fakeLimiter, base);

    await expect(query("releases/7", api, {})).resolves.toEqual({
      data: { id: 7 },
    });
    expect(fakeLimiter.backOff).toHaveBeenCalledTimes(1);
    expect(base).toHaveBeenCalledTimes(2);
  });

  it("gives up once the retries are used up", async () => {
    const fakeLimiter = limiter();
    const base = jest.fn().mockResolvedValue({ error: { status: 429 } });
    const query = throttledBaseQuery(fakeLimiter, base);

    await expect(query("releases/7", api, {})).resolves.toEqual({
      error: { status: 429 },
    });
    expect(base).toHaveBeenCalledTimes(MAX_RETRIES + 1);
  });

  it("does not retry other errors", async () => {
    const fakeLimiter = limiter();
    const base = jest.fn().mockResolvedValue({ error: { status: 404 } });
    const query = throttledBaseQuery(fakeLimiter, base);

    await query("releases/7", api, {});
    expect(base).toHaveBeenCalledTimes(1);
    expect(fakeLimiter.backOff).not.toHaveBeenCalled();
  });
});
