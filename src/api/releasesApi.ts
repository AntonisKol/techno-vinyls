import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ReleaseSummary, ReleaseDetails } from "../types/release";

interface SearchResponse {
  pagination: { page: number; pages: number; per_page: number; items: number };
  results: ReleaseSummary[];
}

export const releasesApi = createApi({
  reducerPath: "releasesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.discogs.com/",
    prepareHeaders: (headers) => {
      headers.set(
        "Authorization",
        `Discogs token=${process.env.REACT_APP_DISCOGS_TOKEN}`
      );
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getTechnoVinylReleases: builder.query<SearchResponse, { page?: number }>({
      query: ({ page = 1 }) =>
        `database/search?format=Vinyl&style=Techno&type=release&sort=year&sort_order=desc&page=${page}&per_page=100`,
    }),

    getReleaseDetails: builder.query<ReleaseDetails, number>({
      query: (id) => `releases/${id}`,
    }),
  }),
});

export const { useGetTechnoVinylReleasesQuery, useGetReleaseDetailsQuery } =
  releasesApi;
