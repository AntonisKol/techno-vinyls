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
  StyledHeader,
  StyledReleaseGrid,
  StyledStatus,
} from "./styled";

const RELEASES_PER_PAGE = 12;

const ReleasesList = () => {
  const [displayPage, setDisplayPage] = useState(1);
  const [rawPage, setRawPage] = useState(1);
  const [filteredReleases, setFilteredReleases] = useState<ReleaseSummary[]>(
    []
  );
  const [artistName, setArtistName] = useState<string | null>(null);
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
  const totalRemotePages = activeData?.pagination.pages ?? 0;

  useEffect(() => {
    if (!activeData) return;

    const requestKey = `${artistName ?? "all"}:${activeData.pagination.page}`;
    if (loadedPages.current.has(requestKey)) return;
    loadedPages.current.add(requestKey);

    const technoOnly = filterStrictlyTechnoReleases(activeData.results);
    setFilteredReleases((previous) =>
      activeData.pagination.page === 1
        ? technoOnly
        : [...previous, ...technoOnly]
    );
  }, [activeData, artistName]);

  const totalPages = Math.ceil(filteredReleases.length / RELEASES_PER_PAGE);
  const currentPageReleases = filteredReleases.slice(
    (displayPage - 1) * RELEASES_PER_PAGE,
    displayPage * RELEASES_PER_PAGE
  );

  useEffect(() => {
    if (isFetching || displayPage <= totalPages || totalPages === 0) return;
    setDisplayPage(totalPages);
  }, [displayPage, isFetching, totalPages]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayPage]);

  const handleSearch = useCallback((name: string) => {
    loadedPages.current.clear();
    setArtistName(name);
    setRawPage(1);
    setDisplayPage(1);
    setFilteredReleases([]);
  }, []);

  const handleResetSearch = useCallback(() => {
    loadedPages.current.clear();
    setArtistName(null);
    setRawPage(1);
    setDisplayPage(1);
    setFilteredReleases([]);
  }, []);

  const handleNextPage = () => {
    if (isFetching) return;
    if (displayPage < totalPages) {
      setDisplayPage((page) => page + 1);
      return;
    }

    if (rawPage < totalRemotePages) {
      setRawPage((page) => page + 1);
    }
  };

  const handleRetry = () => {
    if (artistName === null) refetchTechno();
    else refetchArtist();
  };

  const canGoNext = displayPage < totalPages || rawPage < totalRemotePages;
  const showError = Boolean(error);
  const isRateLimited =
    error !== undefined && "status" in error && error.status === 429;
  const showEmpty =
    !isLoading && !isFetching && !showError && filteredReleases.length === 0;

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

      {(filteredReleases.length > 0 || rawPage < totalRemotePages) && (
        <StyledButtonsContainer>
          <Button
            onClick={() => setDisplayPage((page) => Math.max(1, page - 1))}
            disabled={displayPage === 1 || isFetching}
          >
            Previous
          </Button>
          <Typography variant="caption" color="text.secondary">
            Page {displayPage} of {totalPages || "—"}
          </Typography>
          <Button
            onClick={handleNextPage}
            disabled={!canGoNext || isFetching}
          >
            Next
          </Button>
        </StyledButtonsContainer>
      )}
    </StyledContainer>
  );
};

export default ReleasesList;
