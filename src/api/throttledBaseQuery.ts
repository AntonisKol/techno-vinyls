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

// Discogs' 429 answer has no CORS header, so in the browser a refusal shows
// up as a network error rather than as status 429.
const wasRefused = (error?: FetchBaseQueryError) =>
  error?.status === 429 || error?.status === "FETCH_ERROR";

// Sends every Discogs request through the limiter, searches first, and after a
// refusal waits a full minute and tries once more.
export const throttledBaseQuery =
  (limiter: Limiter, baseQuery: Query): Query =>
  async (args, api, extraOptions) => {
    const url = typeof args === "string" ? args : args.url;
    const priority = url.startsWith("database/search") ? SEARCH : DETAILS;

    for (let attempt = 0; ; attempt += 1) {
      await limiter.schedule(priority);
      const result = await baseQuery(args, api, extraOptions);
      if (!wasRefused(result.error) || attempt === 1) return result;
      limiter.backOff();
    }
  };
