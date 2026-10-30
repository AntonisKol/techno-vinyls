import { fireEvent, render, screen } from "@testing-library/react";
import {
  useGetMarketplaceStatsQuery,
  useGetReleaseDetailsQuery,
} from "../../api/releasesApi";
import ReleaseCard from "./ReleaseCard";
import { ReleaseSummary } from "../../types/release";

jest.mock("../../api/releasesApi", () => ({
  useGetReleaseDetailsQuery: jest.fn(),
  useGetMarketplaceStatsQuery: jest.fn(),
}));

const mockUseGetReleaseDetailsQuery = useGetReleaseDetailsQuery as jest.Mock;
const mockUseGetMarketplaceStatsQuery =
  useGetMarketplaceStatsQuery as jest.Mock;

const release: ReleaseSummary = {
  id: 123,
  title: "Test release",
  format: ["Vinyl"],
  year: 2026,
  genre: ["Electronic"],
  style: ["Techno"],
};

describe("ReleaseCard", () => {
  beforeEach(() => {
    mockUseGetReleaseDetailsQuery.mockReturnValue({
      currentData: {
        images: [
          { type: "primary", uri: "https://images.example/cover.jpg" },
          { type: "secondary", uri: "https://images.example/cover-back.jpg" },
        ],
        labels: [],
      },
    });
    mockUseGetMarketplaceStatsQuery.mockReturnValue({
      currentData: {
        num_for_sale: 3,
        lowest_price: { value: 18.5, currency: "EUR" },
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });
  });

  it("shows Discogs' lowest price and artwork from release details", () => {
    render(<ReleaseCard release={release} />);

    expect(mockUseGetMarketplaceStatsQuery).toHaveBeenCalledWith(123);
    expect(
      screen.getByText("Discogs lowest price: 18,50 €")
    ).toBeInTheDocument();
    expect(screen.getByText("excl. shipping")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Artwork for Test release" })
    ).toHaveAttribute("src", "https://images.example/cover.jpg");
  });

  it("formats the price in the currency Discogs returns", () => {
    mockUseGetMarketplaceStatsQuery.mockReturnValue({
      currentData: { lowest_price: { value: 16.67, currency: "USD" } },
      isLoading: false,
      isError: false,
    });

    render(<ReleaseCard release={release} />);

    expect(
      screen.getByText("Discogs lowest price: 16,67 $")
    ).toBeInTheDocument();
  });

  it("shows unavailable when a release has no current listing price", () => {
    mockUseGetMarketplaceStatsQuery.mockReturnValue({
      currentData: { num_for_sale: 0, lowest_price: null },
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<ReleaseCard release={release} />);

    expect(
      screen.getByText("Discogs lowest price: Unavailable")
    ).toBeInTheDocument();
    expect(screen.queryByText("excl. shipping")).not.toBeInTheDocument();
  });

  it("shows a friendly message when a price lookup is temporarily unavailable", () => {
    mockUseGetMarketplaceStatsQuery.mockReturnValue({
      currentData: undefined,
      isLoading: false,
      isError: true,
      error: { status: 429, data: {} },
    });

    render(<ReleaseCard release={release} />);

    expect(
      screen.getByText("Discogs lowest price: Temporarily unavailable")
    ).toBeInTheDocument();
    expect(screen.queryByText(/rate limit/i)).not.toBeInTheDocument();
  });

  it("tries other Discogs artwork before showing the fallback", () => {
    render(<ReleaseCard release={release} />);

    fireEvent.error(
      screen.getByRole("img", { name: "Artwork for Test release" })
    );

    expect(
      screen.getByRole("img", { name: "Artwork for Test release" })
    ).toHaveAttribute("src", "https://images.example/cover-back.jpg");

    fireEvent.error(
      screen.getByRole("img", { name: "Artwork for Test release" })
    );

    expect(
      screen.getByRole("img", { name: "Artwork unavailable" })
    ).toBeInTheDocument();
  });

  it("shows the search result's catalogue number while the details load", () => {
    mockUseGetReleaseDetailsQuery.mockReturnValue({ currentData: undefined });
    mockUseGetMarketplaceStatsQuery.mockReturnValue({
      currentData: undefined,
      isLoading: true,
      isError: false,
      error: undefined,
    });

    render(<ReleaseCard release={{ ...release, catno: "TAR040" }} />);

    expect(screen.getByText("TAR040")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Loading Discogs lowest price")
    ).toBeInTheDocument();
  });
});
