import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ReleaseSummary, ReleaseDetails } from "../types/release";
import { apiBase } from "./apiBase";

interface SearchResponse {
  pagination: { page: number; pages: number; per_page: number; items: number };
  results: ReleaseSummary[];
}

export const releasesApi = createApi({
  reducerPath: "releasesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiBase(),
  }),
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
