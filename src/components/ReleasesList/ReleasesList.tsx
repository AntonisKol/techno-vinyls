import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Typography } from "@mui/material";
import ReleaseCard from "../ReleaseCard";
import {
  useGetTechnoVinylReleasesQuery,
  useSearchReleasesByArtistQuery,
} from "../../api/releasesApi";
import { ReleaseSummary } from "../../types/release";
import { filterStrictlyTechnoReleases } from "../../helpers";
import ArtistSearch from "../ArtistSearch/ArtistSearch";
import {
  StyledAppDescription,
  StyledButtonsContainer,
  StyledContainer,
  StyledFilterNote,
  StyledHeader,
  StyledReleaseGrid,
  StyledStatus,
} from "./styled";

const RELEASES_PER_PAGE = 10;
// Discogs search stops at page 100 of 100 results, whatever the total.
const DISCOGS_MAX_RESULTS = 10000;

interface Pagination {
  page: number;
  pages: number;
  perPage: number;
  items: number;
}

const ReleasesList = () => {
  const [displayPage, setDisplayPage] = useState(1);
  const [rawPage, setRawPage] = useState(1);
  const [filteredReleases, setFilteredReleases] = useState<ReleaseSummary[]>(
    []
  );
  const [artistName, setArtistName] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const loadedPages = useRef(new Set<string>());
  const topRef = useRef<HTMLDivElement>(null);

  const {
    currentData: technoData,
    isLoading: technoLoading,
    isFetching: technoFetching,
    error: technoError,
    refetch: refetchTechno,
  } = useGetTechnoVinylReleasesQuery(
    { page: rawPage },
    { skip: artistName !== null }
  );

  const {
    currentData: artistData,
    isLoading: artistLoading,
    isFetching: artistFetching,
    error: artistError,
    refetch: refetchArtist,
  } = useSearchReleasesByArtistQuery(
    { artistName: artistName ?? "", page: rawPage },
    { skip: artistName === null }
  );

  const activeData = artistName === null ? technoData : artistData;
  const isLoading = artistName === null ? technoLoading : artistLoading;
  const isFetching = artistName === null ? technoFetching : artistFetching;
  const error = artistName === null ? technoError : artistError;
  const totalRemotePages = pagination?.pages ?? 0;

  useEffect(() => {
    if (!activeData) return;

    const requestKey = `${artistName ?? "all"}:${activeData.pagination.page}`;
    if (loadedPages.current.has(requestKey)) return;
    loadedPages.current.add(requestKey);
    setPagination({
      page: activeData.pagination.page,
      pages: activeData.pagination.pages,
      perPage: activeData.pagination.per_page,
      items: activeData.pagination.items,
    });

    const technoOnly = filterStrictlyTechnoReleases(activeData.results);
    setFilteredReleases((previous) => {
      if (activeData.pagination.page === 1) return technoOnly;
      // Discogs sorts by year only, so a release can show up on two pages.
      const seen = new Set(previous.map((release) => release.id));
      return [
        ...previous,
        ...technoOnly.filter((release) => !seen.has(release.id)),
      ];
    });
  }, [activeData, artistName]);

  const totalPages = Math.ceil(filteredReleases.length / RELEASES_PER_PAGE);
  const currentPageReleases = filteredReleases.slice(
    (displayPage - 1) * RELEASES_PER_PAGE,
    displayPage * RELEASES_PER_PAGE
  );

  const hasMoreRemote = rawPage < totalRemotePages;
  // Set together with filteredReleases, so the page's matches are counted.
  const rawPageProcessed = pagination?.page === rawPage;

  // Keep one release beyond the current page loaded, so pages stay full and
  // Next knows whether there is more. Discogs pages without an exact Techno
  // match are skipped by loading the following page straight away.
  useEffect(() => {
    if (isFetching || error || !rawPageProcessed || !hasMoreRemote) return;
    if (filteredReleases.length > displayPage * RELEASES_PER_PAGE) return;
    setRawPage((page) => page + 1);
  }, [
    displayPage,
    error,
    filteredReleases.length,
    hasMoreRemote,
    isFetching,
    pagination,
    rawPageProcessed,
  ]);

  useEffect(() => {
    if (isFetching || hasMoreRemote) return;
    if (displayPage <= totalPages || totalPages === 0) return;
    setDisplayPage(totalPages);
  }, [displayPage, hasMoreRemote, isFetching, totalPages]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayPage]);

  const handleSearch = useCallback((name: string) => {
    loadedPages.current.clear();
    setArtistName(name);
    setRawPage(1);
    setDisplayPage(1);
    setFilteredReleases([]);
    setPagination(null);
  }, []);

  const handleResetSearch = useCallback(() => {
    loadedPages.current.clear();
    setArtistName(null);
    setRawPage(1);
    setDisplayPage(1);
    setFilteredReleases([]);
    setPagination(null);
  }, []);

  const canGoNext = displayPage < totalPages || hasMoreRemote;

  const handleNextPage = () => {
    if (isFetching || !canGoNext) return;
    setDisplayPage((page) => page + 1);
  };

  const handleRetry = () => {
    if (artistName === null) refetchTechno();
    else refetchArtist();
  };

  const checkedResults = pagination
    ? Math.min(
        pagination.page * pagination.perPage,
        pagination.items,
        DISCOGS_MAX_RESULTS
      )
    : 0;
  const showError = Boolean(error);
  const isRateLimited =
    error !== undefined && "status" in error && error.status === 429;
  const showEmpty =
    !isLoading &&
    !isFetching &&
    !showError &&
    !hasMoreRemote &&
    filteredReleases.length === 0;

  return (
    <StyledContainer ref={topRef}>
      <Typography
        component="p"
        sx={{
          color: "primary.main",
          fontSize: 11,
          fontFamily: "monospace",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          mb: 1,
        }}
      >
        Record discovery · Discogs
      </Typography>
      <StyledHeader variant="h1">Techno Vinyls</StyledHeader>
      <StyledAppDescription>
        Browse vinyl releases tagged exclusively as Techno, search by artist,
        compare catalogue details and current lowest listed prices, then open a
        release on Discogs.
      </StyledAppDescription>

      <StyledFilterNote>
        <strong>What you see:</strong> vinyl releases in Discogs' Electronic
        genre whose only style is Techno, newest first. Releases that also carry
        another style, such as Techno and House, are left out. Artist search
        uses the same filter.
        {pagination && (
          <span data-testid="filter-counts">
            {" "}
            {filteredReleases.length.toLocaleString("en")} found in the first{" "}
            {checkedResults.toLocaleString("en")} of{" "}
            {pagination.items.toLocaleString("en")} Discogs results
            {pagination.items > DISCOGS_MAX_RESULTS
              ? " (Discogs search reaches the newest 10,000)."
              : "."}
          </span>
        )}
      </StyledFilterNote>

      <ArtistSearch
        onSearch={handleSearch}
        onReset={handleResetSearch}
        hasActiveSearch={artistName !== null}
      />

      {showError && (
        <StyledStatus role="alert">
          {isRateLimited
            ? "Discogs rate limit reached. Wait briefly or add a token to .env."
            : "Could not load releases from Discogs. Check your connection and retry."}
          <Button onClick={handleRetry} size="small">
            Retry
          </Button>
        </StyledStatus>
      )}

      {isFetching && (
        <StyledStatus role="status">
          {filteredReleases.length > 0
            ? "Loading more releases…"
            : "Loading releases…"}
        </StyledStatus>
      )}

      {showEmpty && (
        <StyledStatus role="status">
          No exact Techno vinyl releases found. Try another artist.
        </StyledStatus>
      )}

      {currentPageReleases.length > 0 && (
        <StyledReleaseGrid>
          {currentPageReleases.map((release) => (
            <ReleaseCard release={release} key={release.id} />
          ))}
        </StyledReleaseGrid>
      )}

      {(filteredReleases.length > 0 || hasMoreRemote) && (
        <StyledButtonsContainer>
          <Button
            onClick={() => setDisplayPage((page) => Math.max(1, page - 1))}
            disabled={displayPage === 1 || isFetching}
          >
            Previous
          </Button>
          <Typography variant="caption" color="text.secondary">
            Page {displayPage}
            {!hasMoreRemote && totalPages > 0 ? ` of ${totalPages}` : ""}
          </Typography>
          <Button onClick={handleNextPage} disabled={!canGoNext || isFetching}>
            Next
          </Button>
        </StyledButtonsContainer>
      )}
    </StyledContainer>
  );
};

export default ReleasesList;
