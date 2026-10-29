import { fireEvent, render, screen } from "@testing-library/react";
import { useGetReleaseDetailsQuery } from "../../api/releasesApi";
import ReleaseCard from "./ReleaseCard";
import { ReleaseSummary } from "../../types/release";

jest.mock("../../api/releasesApi", () => ({
  useGetReleaseDetailsQuery: jest.fn(),
}));

const mockUseGetReleaseDetailsQuery = useGetReleaseDetailsQuery as jest.Mock;

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
        lowest_price: 18.5,
        images: [
          { type: "primary", uri: "https://images.example/cover.jpg" },
          { type: "secondary", uri: "https://images.example/cover-back.jpg" },
        ],
        labels: [],
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });
  });

  it("shows Discogs' lowest price and artwork from release details", () => {
    render(<ReleaseCard release={release} />);

    expect(screen.getByText("Discogs lowest price: 18,50 €")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Artwork for Test release" }))
      .toHaveAttribute("src", "https://images.example/cover.jpg");
  });

  it("shows unavailable when a release has no current listing price", () => {
    mockUseGetReleaseDetailsQuery.mockReturnValue({
      currentData: { lowest_price: null, images: [], labels: [] },
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<ReleaseCard release={release} />);

    expect(screen.getByText("Discogs lowest price: Unavailable"))
      .toBeInTheDocument();
  });

  it("shows a friendly message when a price lookup is temporarily unavailable", () => {
    mockUseGetReleaseDetailsQuery.mockReturnValue({
      currentData: undefined,
      isLoading: false,
      isError: true,
      error: { status: 429, data: {} },
    });

    render(<ReleaseCard release={release} />);

    expect(screen.getByText("Discogs lowest price: Temporarily unavailable"))
      .toBeInTheDocument();
    expect(screen.queryByText(/rate limit/i)).not.toBeInTheDocument();
  });

  it("tries other Discogs artwork before showing the fallback", () => {
    render(<ReleaseCard release={release} />);

    fireEvent.error(screen.getByRole("img", { name: "Artwork for Test release" }));

    expect(screen.getByRole("img", { name: "Artwork for Test release" }))
      .toHaveAttribute("src", "https://images.example/cover-back.jpg");

    fireEvent.error(screen.getByRole("img", { name: "Artwork for Test release" }));

    expect(screen.getByRole("img", { name: "Artwork unavailable" }))
      .toBeInTheDocument();
  });
});
