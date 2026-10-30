import { createApi } from "@reduxjs/toolkit/query/react";
import "./releasesApi";

// RTK Query's ESM build doesn't load under CRA's Jest, so read the endpoint
// definitions that releasesApi hands to createApi.
jest.mock("@reduxjs/toolkit/query/react", () => ({
  createApi: jest.fn(() => ({})),
  fetchBaseQuery: jest.fn(),
}));

type Definition = { query: (arg: number) => string };

// CRA resets mocks before each test, so keep the call from module load.
const options = (createApi as jest.Mock).mock.calls[0][0];
const endpoints = (): Record<string, Definition> =>
  options.endpoints({ query: (definition: Definition) => definition });

describe("releasesApi", () => {
  it("asks Discogs' marketplace stats for the price in euros", () => {
    expect(endpoints().getMarketplaceStats.query(36327934)).toBe(
      "marketplace/stats/36327934?curr_abbr=EUR"
    );
  });
});
