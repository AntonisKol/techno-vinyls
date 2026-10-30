// Keeps the app under Discogs' rate limit, which counts requests per IP
// address in a moving minute (25 without a token, 60 with one). Requests wait
// their turn instead of being refused; lower priority numbers go first, so a
// search never waits behind a page of price lookups. caps limits a priority's
// share of the window, so price lookups can't use up the room searches need.

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  caps?: Record<number, number>;
  now?: () => number;
  setTimer?: (run: () => void, ms: number) => unknown;
}

export const createRateLimiter = ({
  limit,
  windowMs,
  caps = {},
  now = Date.now,
  setTimer = setTimeout,
}: RateLimiterOptions) => {
  const sent: { time: number; priority: number }[] = [];
  const queue: { priority: number; start: () => void }[] = [];
  let blockedUntil = 0;

  const allowed = (priority: number) => {
    if (sent.length >= limit) return false;
    const cap = caps[priority];
    return (
      cap === undefined ||
      sent.filter((request) => request.priority === priority).length < cap
    );
  };

  const pump = () => {
    while (queue.length > 0) {
      const time = now();
      while (sent.length > 0 && time - sent[0].time >= windowMs) sent.shift();

      const next = queue.findIndex((job) => allowed(job.priority));
      const wait = Math.max(
        next < 0 ? windowMs - (time - sent[0].time) : 0,
        blockedUntil - time
      );
      if (wait > 0) {
        setTimer(pump, wait);
        return;
      }

      const [job] = queue.splice(next, 1);
      sent.push({ time, priority: job.priority });
      job.start();
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
        // Check straight away: a search may be allowed while price lookups
        // are waiting for their share of the window.
        pump();
      }),

    // After Discogs refuses anyway (another tab, or the limit was already
    // used), send nothing until a full window has passed.
    backOff: () => {
      blockedUntil = now() + windowMs;
    },
  };
};
