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
        height: 350,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 2,
        gap: 2,
        transition: "transform 0.1s",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
        }}
      >
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

        {/* Fixed-height title section */}
        <Box
          sx={{
            height: 60,
            overflow: "hidden",
            mb: 1,
            px: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              lineHeight: 1.1,
              fontWeight: 800,
              fontSize: 14,
            }}
            title={release.title}
          >
            {release.title}
          </Typography>
        </Box>

        {/* Fixed-position content section */}
        <Box
          sx={{
            minHeight: 60,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            mt: 2,
          }}
        >
          {details ? (
            <>
              <Typography variant="body2" sx={{ fontSize: 12 }}>
                {catnos && catnos.length > 0
                  ? `Cat No: ${catnos.join(", ")}`
                  : "Cat No N/A"}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontSize: 12 }}>
                {release.year}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
            </>
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
