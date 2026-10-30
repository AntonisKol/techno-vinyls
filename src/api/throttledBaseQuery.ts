import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createRateLimiter } from "./rateLimiter";

type Limiter = ReturnType<typeof createRateLimiter>;
type Query = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

const SEARCH = 0;
const DETAILS = 1;
// A reload or a second tab can use up the minute's allowance; a few retries,
// a minute apart, let every card still get its date and price.
export const MAX_RETRIES = 4;

// Discogs' 429 answer has no CORS header, so in the browser a refusal shows
// up as a network error rather than as status 429.
const wasRefused = (error?: FetchBaseQueryError) =>
  error?.status === 429 || error?.status === "FETCH_ERROR";

// Sends every Discogs request through the limiter, searches first, and after a
// refusal waits a full minute and tries again, up to MAX_RETRIES times.
export const throttledBaseQuery =
  (limiter: Limiter, baseQuery: Query): Query =>
  async (args, api, extraOptions) => {
    const url = typeof args === "string" ? args : args.url;
    const priority = url.startsWith("database/search") ? SEARCH : DETAILS;

    for (let attempt = 0; ; attempt += 1) {
      await limiter.schedule(priority);
      const result = await baseQuery(args, api, extraOptions);
      if (!wasRefused(result.error) || attempt === MAX_RETRIES) return result;
      limiter.backOff();
    }
  };
