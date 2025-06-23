import { useEffect, useRef, useState } from "react";
import { Button, Grid } from "@mui/material";
import ReleaseCard from "../ReleaseCard";
import { useGetTechnoVinylReleasesQuery } from "../../api/releasesApi";
import { ReleaseSummary } from "../../types/release";
import { useReleaseDetailsCache } from "../../hooks/useReleaseDetailsCache";
import {
  StyledAppDescription,
  StyledButtonsContainer,
  StyledContainer,
  StyledHeader,
  StyledLeftColumnContainer,
  StyledRightColumnContainer,
} from "./styled";
import { filterStrictlyTechnoReleases } from "../../helpers";

const ReleasesList = () => {
  const [displayPage, setDisplayPage] = useState(1);
  const [rawPage, setRawPage] = useState(1);
  const [filteredReleases, setFilteredReleases] = useState<ReleaseSummary[]>(
    []
  );

  const { prefetchDetails, cache } = useReleaseDetailsCache();

  const topRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const releasesPerPage = 10;
  const { data, isLoading, error } = useGetTechnoVinylReleasesQuery({
    page: rawPage,
  });

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }, [displayPage]);

  useEffect(() => {
    if (!data?.results) return;

    const technoOnly = filterStrictlyTechnoReleases(data.results);
    setFilteredReleases((prev) => [...prev, ...technoOnly]);
  }, [data]);

  const totalPages = Math.ceil(filteredReleases.length / releasesPerPage);
  const currentPageReleases = filteredReleases.slice(
    (displayPage - 1) * releasesPerPage,
    displayPage * releasesPerPage
  );

  const handleNextPage = () => {
    const nextPage = displayPage + 1;
    if (nextPage > totalPages) setRawPage((prev) => prev + 1);
    setDisplayPage(nextPage);
  };

  const handlePrevPage = () => {
    if (displayPage > 1) setDisplayPage((prev) => prev - 1);
  };

  if (error) return <div>Error loading releases.</div>;
  if (!filteredReleases.length && isLoading) return <div>Loading...</div>;

  return (
    <StyledContainer ref={topRef}>
      <Grid container sx={{ height: "100%" }}>
        <StyledLeftColumnContainer item xs={4}>
          <StyledHeader>Techno Vinyls</StyledHeader>
        </StyledLeftColumnContainer>

        <StyledRightColumnContainer ref={scrollRef} item xs={8}>
          <StyledAppDescription>
            This page exclusively filters vinyl-only releases within the Techno
            genre, excluding any combined or crossover styles such as Dub
            Techno. It displays detailed release information along with the
            current lowest available price. Upcoming features include filters by
            country and release year, sorting from most recent to oldest, and an
            artist search function.
          </StyledAppDescription>
          <Grid container spacing={2}>
            {currentPageReleases.map((release) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={release.id}>
                <ReleaseCard
                  release={release}
                  preloadDetails={() => prefetchDetails(release.id)}
                  details={cache[release.id]}
                />
              </Grid>
            ))}
          </Grid>
          <StyledButtonsContainer>
            <Button onClick={handlePrevPage} disabled={displayPage === 1}>
              Previous
            </Button>
            <Button onClick={handleNextPage}>Next</Button>
          </StyledButtonsContainer>
        </StyledRightColumnContainer>
      </Grid>
    </StyledContainer>
  );
};

export default ReleasesList;
