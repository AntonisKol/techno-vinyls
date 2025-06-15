import { useRef, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";

import ReleaseCard from "../ReleaseCard";
import {
  releasesApi,
  useGetTechnoVinylReleasesQuery,
} from "../../api/releasesApi";
import { ReleaseDetails } from "../../types/release";

const ReleasesList = () => {
  // Cache for release details
  const detailsCacheRef = useRef<Record<number, ReleaseDetails>>({});

  // Use lazy query hook from API slice
  const [fetchDetails] = releasesApi.endpoints.getReleaseDetails.useLazyQuery();

  const [page, setPage] = useState(1);

  // Prefetch details and cache
  const prefetchDetails = async (id: number) => {
    if (detailsCacheRef.current[id]) return; // Already cached

    try {
      const result = await fetchDetails(id).unwrap();
      detailsCacheRef.current[id] = result;
    } catch (err) {
      console.error(`Failed to fetch release ${id}:`, err);
    }
  };

  // Get paginated releases
  const { data, error, isLoading } = useGetTechnoVinylReleasesQuery({ page });

  if (error) return <div>Error loading releases.</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data || !Array.isArray(data.results) || data.results.length === 0)
    return <div>No releases found.</div>;

  const filteredReleases = data.results;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Grid container sx={{ height: "100%" }}>
        {/* Left Column */}
        <Grid
          item
          xs={4}
          sx={{
            color: "#000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 4,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontWeight: "bold",
              fontSize: "23rem",
              textAlign: "center",
              mt: 2,
              pointerEvents: "none",
            }}
          >
            Techno Vinyls
          </Typography>
        </Grid>

        {/* Right Column */}
        <Grid
          item
          xs={8}
          sx={{
            bgcolor: "black",
            height: "100%",
            overflowY: "auto",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            paddingTop: "40vh",
            position: "relative",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: 150,
              transform: "translateX(-50%)",
              color: "white",
              pointerEvents: "none",
            }}
          >
            Techno Vinyls
          </Typography>

          <Grid container spacing={2}>
            {filteredReleases.map((release) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={release.id}>
                <ReleaseCard
                  release={release}
                  preloadDetails={() => prefetchDetails(release.id)}
                  details={detailsCacheRef.current[release.id]}
                />
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              disabled={page >= data.pagination.pages}
              onClick={() =>
                setPage((p) => Math.min(p + 1, data.pagination.pages))
              }
            >
              Next
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReleasesList;
