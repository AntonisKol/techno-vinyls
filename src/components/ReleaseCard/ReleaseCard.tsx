import AlbumOutlinedIcon from "@mui/icons-material/AlbumOutlined";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Link,
  Skeleton,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useGetReleaseDetailsQuery } from "../../api/releasesApi";
import { ReleaseSummary } from "../../types/release";
import { cardDetails, cardFrame, TITLE_LINES } from "./cardFrame";

const ReleaseCard = ({ release }: { release: ReleaseSummary }) => {
  const {
    currentData: details,
    isLoading,
    isError,
  } = useGetReleaseDetailsQuery(release.id);

  // The search result's catalogue number shows until the details arrive.
  const catnos = Array.from(
    new Set(
      (details?.labels?.map((label) => label.catno) ?? [release.catno]).filter(
        (catno): catno is string => Boolean(catno) && catno !== "none"
      )
    )
  );
  const primaryImage = details?.images?.find(
    (image) => image.type === "primary"
  );
  const artworkCandidates: (string | undefined)[] = [
    release.cover_image,
    release.thumb,
    primaryImage?.uri,
    primaryImage?.uri150,
  ];
  details?.images?.forEach((image) => {
    if (image !== primaryImage) {
      artworkCandidates.push(image.uri, image.uri150);
    }
  });
  const artworkUrls = Array.from(
    new Set(artworkCandidates.filter((url): url is string => Boolean(url)))
  );
  const [artworkIndex, setArtworkIndex] = useState(0);
  const artworkUrl = artworkUrls[artworkIndex];
  const priceFormatted =
    details?.lowest_price != null && Number.isFinite(details.lowest_price)
      ? new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(details.lowest_price)
      : "Unavailable";

  return (
    <Card
      sx={{
        ...cardFrame,
        transition: "border-color 0.15s, transform 0.15s",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent
        sx={{ display: "flex", gap: 2, p: 2, "&:last-child": { pb: 2 } }}
      >
        {artworkUrl ? (
          <Box
            component="img"
            src={artworkUrl}
            alt={`Artwork for ${release.title}`}
            loading="lazy"
            onError={() => setArtworkIndex((index) => index + 1)}
            sx={{
              width: 72,
              height: 72,
              flex: "0 0 72px",
              border: "1px solid",
              borderColor: "divider",
              objectFit: "cover",
            }}
          />
        ) : (
          <Box
            aria-label="Artwork unavailable"
            role="img"
            sx={{
              width: 72,
              height: 72,
              flex: "0 0 72px",
              display: "grid",
              placeItems: "center",
              border: "1px solid",
              borderColor: "divider",
              color: "primary.main",
              bgcolor: "background.default",
            }}
          >
            <AlbumOutlinedIcon />
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              lineHeight: 1.25,
              fontWeight: 800,
              display: "-webkit-box",
              WebkitLineClamp: TITLE_LINES,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              overflowWrap: "anywhere",
            }}
            title={release.title}
          >
            {release.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {release.year || "Year unavailable"}
          </Typography>
        </Box>
      </CardContent>

      <CardContent sx={cardDetails}>
        <Typography variant="body2" color="text.secondary" noWrap>
          {catnos?.length ? catnos.join(", ") : "Catalogue number unavailable"}
        </Typography>
        <Box
          sx={{ display: "flex", alignItems: "center", minHeight: 28, mt: 1 }}
        >
          {isLoading ? (
            <Skeleton
              animation="wave"
              width={170}
              height={28}
              aria-label="Loading Discogs lowest price"
            />
          ) : (
            <Typography
              variant="body2"
              color={isError ? "text.secondary" : "primary.main"}
            >
              Discogs lowest price:{" "}
              {isError ? "Temporarily unavailable" : priceFormatted}
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Link
          href={`https://www.discogs.com/release/${release.id}`}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{ fontSize: 12, color: "primary.main" }}
        >
          View on Discogs
        </Link>
      </CardActions>
    </Card>
  );
};

export default ReleaseCard;
