import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
jest.mock("../ReleaseCard", () => () => <div data-testid="release-card" />);

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

  it("shows a user-friendly message when release data is temporarily unavailable", () => {
    render(<ReleasesList />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Releases are temporarily unavailable. Please try again shortly."
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(/rate limit|\.env|token/i);
  });

  it("shows 12 releases per page with visible previous and next controls", async () => {
    mockUseGetTechnoVinylReleasesQuery.mockReturnValue({
      currentData: {
        pagination: { page: 1, pages: 100, per_page: 100, items: 183350 },
        results: Array.from({ length: 13 }, (_, index) => ({
          id: index + 1,
          title: `Release ${index + 1}`,
          format: ["Vinyl"],
          style: ["Techno"],
          year: 2020,
          genre: ["Electronic"],
        })),
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<ReleasesList />);

    await waitFor(() => {
      expect(screen.getAllByTestId("release-card")).toHaveLength(12);
    });
    expect(screen.getByText(/183,350 matching candidates/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      expect(screen.getAllByTestId("release-card")).toHaveLength(1);
    });
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
    expect(screen.getByText("Page 2")).toBeInTheDocument();
    expect(screen.queryByText(/of 2/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });
});
