import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ReleaseSummary, ReleaseDetails } from "../types/release";

interface SearchResponse {
  pagination: { page: number; pages: number; per_page: number; items: number };
  results: ReleaseSummary[];
}

export const releasesApi = createApi({
  reducerPath: "releasesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/discogs/",
  }),
  endpoints: (builder) => ({
    getTechnoVinylReleases: builder.query<SearchResponse, { page?: number }>({
      query: ({ page = 1 }) =>
        `database/search?format=Vinyl&genre=Electronic&style=Techno&type=release&sort=year&sort_order=desc&page=${page}&per_page=100`,
    }),

    getReleaseDetails: builder.query<ReleaseDetails, number>({
      query: (id) => `releases/${id}`,
    }),

    searchReleasesByArtist: builder.query<SearchResponse, string>({
      query: (artistName) =>
        `database/search?artist=${encodeURIComponent(
          artistName
        )}&format=Vinyl&type=release&sort=year&sort_order=desc&page=1&per_page=100`,
    }),
  }),
});

export const {
  useGetTechnoVinylReleasesQuery,
  useGetReleaseDetailsQuery,
  useSearchReleasesByArtistQuery,
} = releasesApi;
