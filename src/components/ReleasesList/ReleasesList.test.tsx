import { fireEvent, render, screen } from "@testing-library/react";
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

  it("explains how to recover from a Discogs rate limit", () => {
    render(<ReleasesList />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Discogs rate limit reached. Wait briefly or add a token to .env."
    );
  });

  it("says what the list is filtered to and how much of Discogs was checked", () => {
    mockUseGetTechnoVinylReleasesQuery.mockImplementation(
      discogsPages([{ techno: 28, mixed: 72 }, { techno: 30 }])
    );

    render(<ReleasesList />);

    expect(screen.getByText(/whose only style is Techno/)).toBeInTheDocument();
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

    expect(screen.getByText(/^Page /)).toHaveTextContent(/^Page 5$/);
    expect(screen.getAllByTestId("release")).toHaveLength(10);
    expect(screen.getAllByTestId("release")[0]).toHaveTextContent("Release 41");
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
    expect(screen.getAllByTestId("release")).toHaveLength(10);
  });

  it("shows the last page count once Discogs has nothing more", () => {
    mockUseGetTechnoVinylReleasesQuery.mockImplementation(
      discogsPages([{ techno: 15 }])
    );

    render(<ReleasesList />);
    const next = screen.getByRole("button", { name: "Next" });
    fireEvent.click(next);

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getAllByTestId("release")).toHaveLength(5);
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
      // Page 2 starts with the last release of page 1.
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
    expect(titles).toEqual([
      "Release 11",
      "Release 12",
      ...Array.from({ length: 8 }, (_, i) => `Release ${i + 13}`),
    ]);
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
});
