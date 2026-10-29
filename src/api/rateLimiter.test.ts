import { createRateLimiter } from "./rateLimiter";

// A fake clock: timers run when the test moves time forward.
const fakeClock = () => {
  let time = 0;
  let timers: { at: number; run: () => void }[] = [];
  return {
    now: () => time,
    setTimer: (run: () => void, ms: number) => {
      timers.push({ at: time + ms, run });
    },
    advance: async (ms: number) => {
      time += ms;
      const due = timers.filter((timer) => timer.at <= time);
      timers = timers.filter((timer) => timer.at > time);
      due.forEach((timer) => timer.run());
      await Promise.resolve();
    },
  };
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("createRateLimiter", () => {
  it("sends up to the limit at once and the rest when the minute moves on", async () => {
    const clock = fakeClock();
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, ...clock });
    const started: number[] = [];
    [1, 2, 3].forEach((n) => limiter.schedule().then(() => started.push(n)));

    await flush();
    expect(started).toEqual([1, 2]);

    await clock.advance(59_999);
    await flush();
    expect(started).toEqual([1, 2]);

    await clock.advance(1);
    await flush();
    expect(started).toEqual([1, 2, 3]);
  });

  it("lets a search go before price lookups that are already waiting", async () => {
    const clock = fakeClock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, ...clock });
    const started: string[] = [];
    limiter.schedule(1).then(() => started.push("price 1"));
    limiter.schedule(1).then(() => started.push("price 2"));
    limiter.schedule(0).then(() => started.push("search"));

    await flush();
    await clock.advance(1_000);
    await flush();
    await clock.advance(1_000);
    await flush();
    expect(started).toEqual(["price 1", "search", "price 2"]);
  });

  it("sends nothing for a full window after backing off", async () => {
    const clock = fakeClock();
    const limiter = createRateLimiter({
      limit: 25,
      windowMs: 60_000,
      ...clock,
    });
    limiter.backOff();
    let started = false;
    limiter.schedule().then(() => {
      started = true;
    });

    await clock.advance(30_000);
    await flush();
    expect(started).toBe(false);

    await clock.advance(30_000);
    await flush();
    expect(started).toBe(true);
  });

  it("keeps room for searches when price lookups reach their share", async () => {
    const clock = fakeClock();
    const limiter = createRateLimiter({
      limit: 4,
      windowMs: 60_000,
      caps: { 1: 2 },
      ...clock,
    });
    const started: string[] = [];
    ["price 1", "price 2", "price 3"].forEach((name) =>
      limiter.schedule(1).then(() => started.push(name))
    );
    await flush();
    expect(started).toEqual(["price 1", "price 2"]);

    limiter.schedule(0).then(() => started.push("search"));
    await flush();
    expect(started).toEqual(["price 1", "price 2", "search"]);

    await clock.advance(60_000);
    await flush();
    expect(started).toEqual(["price 1", "price 2", "search", "price 3"]);
  });
});
