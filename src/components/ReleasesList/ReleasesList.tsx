import { useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";

import ReleaseCard from "../ReleaseCard";
import { useGetTechnoVinylReleasesQuery } from "../../api/releasesApi";
import { ReleaseSummary } from "../../types/release";

const excludedStyles = [
  "Experimental",
  "Downtempo",
  "Ambient",
  "Breakbeat",
  "Drum n Bass",
  "Dubstep",
  "EDM",
  "IDM",
  "Electro",
  "Progressive House",
  "Trance",
  "Hardcore",
  "Hardstyle",
  "Tech House",
  "Deep House",
  "House",
  "Minimal",
  "Trip Hop",
];

const isAllowedRelease = (release: ReleaseSummary) => {
  if (!release.style) return true;
  return !release.style.some((style) => excludedStyles.includes(style));
};

const ReleasesList = () => {
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useGetTechnoVinylReleasesQuery({ page });

  if (error) return <div>Error loading releases.</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data?.results.length) return <div>No releases found.</div>;
  const filteredReleases = data.results.filter(isAllowedRelease);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Grid container sx={{ height: "100%" }}>
        {/* Left Column (1/3) */}
        <Grid
          item
          xs={4}
          sx={{
            bgcolor: "#112233",
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
                <ReleaseCard key={release.id} release={release} />
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
                setPage((p) => Math.max(p + 1, data.pagination.pages || p + 1))
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
