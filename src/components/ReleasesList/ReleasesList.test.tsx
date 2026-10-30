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
jest.mock(
  "../ReleaseCard",
  () =>
    ({ release }: { release: { title: string } }) => (
      <div data-testid="release">{release.title}</div>
    )
);

const release = (id: number, style = ["Techno"]) => ({
  id,
  title: `Release ${id}`,
  format: ["Vinyl", '12"'],
  year: 2026,
  genre: ["Electronic"],
  style,
});

// One Discogs page per entry: how many exact Techno and how many mixed-style
// results it holds.
const discogsPages = (pages: { techno: number; mixed?: number }[]) => {
  let nextId = 1;
  const data = pages.map(({ techno, mixed = 0 }, index) => {
    const results = [
      ...Array.from({ length: techno }, () => release(nextId++)),
      ...Array.from({ length: mixed }, () =>
        release(nextId++, ["Techno", "House"])
      ),
    ];
    return {
      pagination: {
        page: index + 1,
        pages: pages.length,
        per_page: 100,
        items: pages.length * 100,
      },
      results,
    };
  });
  return ({ page = 1 }: { page?: number }) => ({
    currentData: data[page - 1],
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: jest.fn(),
  });
};

const requestedPages = () =>
  mockUseGetTechnoVinylReleasesQuery.mock.calls.map(([args]) => args.page);

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
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      /rate limit|\.env|token/i
    );
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
      expect(screen.getAllByTestId("release")).toHaveLength(12);
    });
    expect(screen.getByTestId("filter-counts")).toHaveTextContent(
      "13 found in the first 100 of 183,350 Discogs results"
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      expect(screen.getAllByTestId("release")).toHaveLength(1);
    });
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
    expect(screen.getByText(/^Page 2 of about/)).toBeInTheDocument();
    expect(screen.queryByText(/of 2$/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("says what the list is filtered to and how much of Discogs was checked", () => {
    mockUseGetTechnoVinylReleasesQuery.mockImplementation(
      discogsPages([{ techno: 28, mixed: 72 }, { techno: 30 }])
    );

    render(<ReleasesList />);

    expect(screen.getByText(/whose only style is Techno/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Prices are the cheapest copy for sale now, excl\. shipping\./
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("filter-counts")).toHaveTextContent(
      "28 found in the first 100 of 200 Discogs results."
    );
  });

  it("keeps paging past the first Discogs page with Next", () => {
    mockUseGetTechnoVinylReleasesQuery.mockImplementation(
      discogsPages([
        { techno: 25 },
        { techno: 25 },
        { techno: 25 },
        { techno: 25 },
      ])
    );

    render(<ReleasesList />);
    const next = screen.getByRole("button", { name: "Next" });
    for (let i = 0; i < 4; i += 1) fireEvent.click(next);

    expect(screen.getByText(/^Page /)).toHaveTextContent(/^Page 5 of about/);
    expect(screen.getAllByTestId("release")).toHaveLength(12);
    expect(screen.getAllByTestId("release")[0]).toHaveTextContent("Release 49");
    expect(requestedPages()).toEqual(expect.arrayContaining([1, 2, 3]));
    expect(requestedPages()).not.toContain(4);
    expect(next).toBeEnabled();
  });

  it("loads the next Discogs page by itself when one has no exact match", () => {
    mockUseGetTechnoVinylReleasesQuery.mockImplementation(
      discogsPages([{ techno: 4 }, { techno: 0, mixed: 100 }, { techno: 12 }])
    );

    render(<ReleasesList />);

    expect(requestedPages()).toEqual(expect.arrayContaining([1, 2, 3]));
    expect(screen.getAllByTestId("release")).toHaveLength(12);
  });

  it("shows the last page count once Discogs has nothing more", () => {
    mockUseGetTechnoVinylReleasesQuery.mockImplementation(
      discogsPages([{ techno: 15 }])
    );

    render(<ReleasesList />);
    const next = screen.getByRole("button", { name: "Next" });
    fireEvent.click(next);

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getAllByTestId("release")).toHaveLength(3);
    expect(next).toBeDisabled();
  });

  it("shows a release only once when Discogs repeats it on the next page", () => {
    const pages = discogsPages([
      { techno: 12 },
      { techno: 12 },
      { techno: 12 },
    ]);
    mockUseGetTechnoVinylReleasesQuery.mockImplementation((args) => {
      const response = pages(args);
      if (args.page !== 2) return response;
      // Page 2 starts with the last release of page 1, which must not show twice.
      const repeated = pages({ page: 1 }).currentData!.results[11];
      return {
        ...response,
        currentData: {
          ...response.currentData!,
          results: [repeated, ...response.currentData!.results],
        },
      };
    });

    render(<ReleasesList />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    const titles = screen
      .getAllByTestId("release")
      .map((card) => card.textContent);
    expect(titles).toEqual(
      Array.from({ length: 12 }, (_, i) => `Release ${i + 13}`)
    );
  });

  it("says nothing was found only after the last Discogs page", () => {
    const pages = discogsPages([{ techno: 0, mixed: 3 }, { techno: 0 }]);
    let fetchedPages = 1;
    mockUseGetTechnoVinylReleasesQuery.mockImplementation((args) =>
      args.page <= fetchedPages
        ? pages(args)
        : { ...pages({ page: 1 }), currentData: undefined, isFetching: true }
    );

    const { rerender } = render(<ReleasesList />);
    expect(screen.queryByText(/No exact Techno/)).not.toBeInTheDocument();

    fetchedPages = 2;
    rerender(<ReleasesList />);
    expect(screen.getByText(/No exact Techno/)).toBeInTheDocument();
  });

  it("leaves the heading to the page when embedded, but keeps the filter note", () => {
    mockUseGetTechnoVinylReleasesQuery.mockImplementation(
      discogsPages([{ techno: 3 }])
    );

    render(<ReleasesList embedded />);

    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.getByText(/whose only style is Techno/)).toBeInTheDocument();
    expect(screen.getAllByTestId("release")).toHaveLength(3);
  });

  it("shows skeleton cards while the first releases load", () => {
    mockUseGetTechnoVinylReleasesQuery.mockReturnValue({
      currentData: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<ReleasesList />);

    expect(screen.getAllByTestId("release-skeleton")).toHaveLength(12);
    expect(screen.getByRole("status")).toHaveTextContent("Loading releases…");
  });

  it("fills a partly loaded page with skeletons while more load", () => {
    const pages = discogsPages([{ techno: 15 }, { techno: 15 }]);
    mockUseGetTechnoVinylReleasesQuery.mockImplementation((args) =>
      args.page === 1
        ? pages(args)
        : { ...pages({ page: 1 }), currentData: undefined, isFetching: true }
    );

    render(<ReleasesList />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getAllByTestId("release")).toHaveLength(3);
    expect(screen.getAllByTestId("release-skeleton")).toHaveLength(9);
  });

  it("shows no skeletons when Discogs fails", () => {
    render(<ReleasesList />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByTestId("release-skeleton")).not.toBeInTheDocument();
  });

  it("estimates how many pages there are while Discogs has more", () => {
    // 28 of the first 100 match; Discogs reports 183,350, of which search
    // reaches 10,000: about 2,800 releases, 234 pages of 12.
    mockUseGetTechnoVinylReleasesQuery.mockReturnValue({
      currentData: {
        pagination: { page: 1, pages: 100, per_page: 100, items: 183350 },
        results: [
          ...Array.from({ length: 28 }, (_, i) => release(i + 1)),
          ...Array.from({ length: 72 }, (_, i) =>
            release(i + 100, ["Techno", "House"])
          ),
        ],
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<ReleasesList />);

    expect(screen.getByText(/^Page /)).toHaveTextContent("Page 1 of about 234");
  });
});
