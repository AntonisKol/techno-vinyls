import { render, screen } from "@testing-library/react";
import {
  useGetTechnoVinylReleasesQuery,
  useSearchReleasesByArtistQuery,
} from "../../api/releasesApi";
import ReleasesList from "./ReleasesList";

jest.mock("../../api/releasesApi", () => ({
  useGetTechnoVinylReleasesQuery: jest.fn(),
  useSearchReleasesByArtistQuery: jest.fn(),
}));
jest.mock("../ArtistSearch/ArtistSearch", () => () => null);
jest.mock("../ReleaseCard", () => () => null);

const mockUseGetTechnoVinylReleasesQuery =
  useGetTechnoVinylReleasesQuery as jest.Mock;
const mockUseSearchReleasesByArtistQuery =
  useSearchReleasesByArtistQuery as jest.Mock;

describe("ReleasesList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: jest.fn(),
    });
    mockUseGetTechnoVinylReleasesQuery.mockReturnValue({
      currentData: undefined,
      isLoading: false,
      isFetching: false,
      error: { status: 429, data: {} },
      refetch: jest.fn(),
    });
    mockUseSearchReleasesByArtistQuery.mockReturnValue({
      currentData: undefined,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: jest.fn(),
    });
  });

  it("explains how to recover from a Discogs rate limit", () => {
    render(<ReleasesList />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Discogs rate limit reached. Wait briefly or add a token to .env."
    );
  });
});
