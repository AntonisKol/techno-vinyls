import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { ReleaseDetails } from "../types/release";

type Query = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

const PREFIX = "techno-vinyls:";
// A release's date, catalogue numbers and artwork rarely change, so they're
// kept for a day; prices aren't stored and refresh as before.
export const DETAILS_TTL = 24 * 60 * 60 * 1000;

const browserStorage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null; // blocked, e.g. by privacy settings
  }
};

// Only what the card shows, so many releases fit in the browser's storage.
const keep = (data: ReleaseDetails): ReleaseDetails => ({
  id: data.id,
  title: data.title,
  format: data.format,
  year: data.year,
  genre: data.genre,
  style: data.style,
  released_formatted: data.released_formatted,
  labels: data.labels?.map(({ name, catno }) => ({ name, catno })),
  images: data.images?.map(({ type, uri, uri150 }) => ({ type, uri, uri150 })),
});

const dropExpired = (storage: Storage, time: number) => {
  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (!key?.startsWith(PREFIX)) continue;
    try {
      if (JSON.parse(storage.getItem(key) ?? "null")?.expiresAt > time)
        continue;
    } catch {}
    storage.removeItem(key);
  }
};

// Answers release-detail requests from the browser's storage when it has a
// fresh copy, so reloads and paging back don't use up Discogs' allowance.
export const storedBaseQuery =
  (
    baseQuery: Query,
    storage: Storage | null = browserStorage(),
    now: () => number = Date.now
  ): Query =>
  async (args, api, extraOptions) => {
    const url = typeof args === "string" ? args : args.url;
    if (!storage || !url.startsWith("releases/")) {
      return baseQuery(args, api, extraOptions);
    }

    const key = PREFIX + url;
    try {
      const stored = JSON.parse(storage.getItem(key) ?? "null");
      if (stored?.expiresAt > now()) return { data: stored.data };
    } catch {}

    const result = await baseQuery(args, api, extraOptions);
    if (result.data) {
      const entry = JSON.stringify({
        expiresAt: now() + DETAILS_TTL,
        data: keep(result.data as ReleaseDetails),
      });
      try {
        storage.setItem(key, entry);
      } catch {
        // Full: make room from expired releases and try once more.
        dropExpired(storage, now());
        try {
          storage.setItem(key, entry);
        } catch {}
      }
    }
    return result;
  };
