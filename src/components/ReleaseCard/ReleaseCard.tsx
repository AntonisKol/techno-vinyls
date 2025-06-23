import { useEffect } from "react";
import { ReleaseSummary, ReleaseDetails } from "../../types/release";
import { Box, Card, CircularProgress, Link, Typography } from "@mui/material";
import theme from "../../theme";

const ReleaseCard = ({
  release,
  preloadDetails,
  details,
}: {
  release: ReleaseSummary;
  preloadDetails: () => void;
  details?: ReleaseDetails;
}) => {
  useEffect(() => {
    preloadDetails();
  }, [preloadDetails]);

  const catnos = details?.labels?.map((label) => label.catno).filter(Boolean);
  const priceFormatted = details?.lowest_price
    ? new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(details.lowest_price)
    : "Price N/A";

  return (
    <Card
      sx={{
        color: "text.primary",
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 2,
        gap: 4,
        transition: "transform 0.1s",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
    >
      <Box sx={{ flexGrow: 1, textAlign: "center" }}>
        <img
          src={release.cover_image}
          alt={release.title}
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: 20,
            boxShadow: "0 0 8px #000",
          }}
        />
        <Box>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ lineHeight: 1, fontWeight: 800 }}
            >
              {release.title}
            </Typography>
          </Box>
        </Box>
        <Box>
          {details ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "space-between",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography variant="body2" sx={{ fontSize: 12 }}>
                {catnos && catnos.length > 0
                  ? `Cat No: ${catnos.join(", ")}`
                  : "Cat No N/A"}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontSize: 12 }}>
                {release.year}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: theme.palette.mode,
                }}
              >
                Lowest price: {priceFormatted}
              </Typography>
            </Box>
          ) : (
            <CircularProgress size={16} thickness={1} />
          )}
        </Box>
      </Box>

      <Box>
        <Link
          href={`https://www.discogs.com/release/${release.id}`}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{ fontSize: 12 }}
        >
          View on Discogs
        </Link>
      </Box>
    </Card>
  );
};

export default ReleaseCard;
