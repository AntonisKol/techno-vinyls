// Keeps the app under Discogs' rate limit, which counts requests per IP
// address in a moving minute (25 without a token, 60 with one). Requests wait
// their turn instead of being refused; lower priority numbers go first, so a
// search never waits behind a page of price lookups.

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
  setTimer?: (run: () => void, ms: number) => unknown;
}

export const createRateLimiter = ({
  limit,
  windowMs,
  now = Date.now,
  setTimer = setTimeout,
}: RateLimiterOptions) => {
  const sent: number[] = [];
  const queue: { priority: number; start: () => void }[] = [];
  let blockedUntil = 0;
  let waiting = false;

  const pump = () => {
    waiting = false;
    while (queue.length > 0) {
      const time = now();
      while (sent.length > 0 && time - sent[0] >= windowMs) sent.shift();

      const waitForWindow =
        sent.length >= limit ? windowMs - (time - sent[0]) : 0;
      const wait = Math.max(waitForWindow, blockedUntil - time);
      if (wait > 0) {
        waiting = true;
        setTimer(pump, wait);
        return;
      }

      sent.push(time);
      queue.shift()!.start();
    }
  };

  return {
    // Resolves when the request may be sent.
    schedule: (priority = 0) =>
      new Promise<void>((resolve) => {
        const job = { priority, start: resolve };
        const later = queue.findIndex((queued) => queued.priority > priority);
        if (later < 0) queue.push(job);
        else queue.splice(later, 0, job);
        if (!waiting) pump();
      }),

    // After Discogs refuses anyway (another tab, or the limit was already
    // used), send nothing until a full window has passed.
    backOff: () => {
      blockedUntil = now() + windowMs;
    },
  };
};
