import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ReleaseSummary, ReleaseDetails } from "../types/release";
import { apiBase, LOCAL_API_BASE } from "./apiBase";
import { createRateLimiter } from "./rateLimiter";
import { throttledBaseQuery } from "./throttledBaseQuery";

interface SearchResponse {
  pagination: { page: number; pages: number; per_page: number; items: number };
  results: ReleaseSummary[];
}

// Discogs allows 25 requests a minute per IP without a token (the hosted app)
// and 60 with one (proxy.js with a token); stay a little under either.
const base = apiBase();
const limit = base === LOCAL_API_BASE ? 55 : 22;
const limiter = createRateLimiter({
  limit,
  windowMs: 60_000,
  // Price lookups (priority 1) leave a few requests a minute for searches,
  // so Next never waits for the next Discogs page.
  caps: { 1: limit - 4 },
});

export const releasesApi = createApi({
  reducerPath: "releasesApi",
  baseQuery: throttledBaseQuery(limiter, fetchBaseQuery({ baseUrl: base })),
  endpoints: (builder) => ({
    getTechnoVinylReleases: builder.query<SearchResponse, { page?: number }>({
      query: ({ page = 1 }) =>
        `database/search?format=Vinyl&genre=Electronic&style=Techno&type=release&sort=year&sort_order=desc&page=${page}&per_page=100`,
      keepUnusedDataFor: 15 * 60,
    }),

    getReleaseDetails: builder.query<ReleaseDetails, number>({
      query: (id) => `releases/${id}`,
      keepUnusedDataFor: 5 * 60,
    }),

    searchReleasesByArtist: builder.query<
      SearchResponse,
      { artistName: string; page?: number }
    >({
      query: ({ artistName, page = 1 }) =>
        `database/search?artist=${encodeURIComponent(
          artistName
        )}&format=Vinyl&genre=Electronic&style=Techno&type=release&sort=year&sort_order=desc&page=${page}&per_page=100`,
      keepUnusedDataFor: 15 * 60,
    }),
  }),
});

export const {
  useGetTechnoVinylReleasesQuery,
  useGetReleaseDetailsQuery,
  useSearchReleasesByArtistQuery,
} = releasesApi;
