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
import {
  useGetMarketplaceStatsQuery,
  useGetReleaseDetailsQuery,
} from "../../api/releasesApi";
import { ReleaseSummary } from "../../types/release";
import { cardDetails, cardFrame, TITLE_LINES } from "./cardFrame";

const ReleaseCard = ({ release }: { release: ReleaseSummary }) => {
  const { currentData: details } = useGetReleaseDetailsQuery(release.id);
  const {
    currentData: stats,
    isLoading,
    isError,
  } = useGetMarketplaceStatsQuery(release.id);

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
  const lowestPrice = stats?.lowest_price;
  const hasPrice =
    !isLoading && !isError && Number.isFinite(lowestPrice?.value);
  const priceFormatted =
    lowestPrice && hasPrice
      ? new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: lowestPrice.currency || "EUR",
        }).format(lowestPrice.value)
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
              aria-label="Loading cheapest price for sale"
            />
          ) : (
            <Typography
              variant="body2"
              color={isError ? "text.secondary" : "primary.main"}
            >
              Cheapest for sale now:{" "}
              {isError ? "Temporarily unavailable" : priceFormatted}
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions
        sx={{ px: 2, pb: 2, justifyContent: "space-between", gap: 1 }}
      >
        {/* The release's listings, cheapest first: the top one is the price above.
            The release page itself only shows past sales (Low / Median / High). */}
        <Link
          href={`https://www.discogs.com/sell/release/${release.id}?sort=price%2Casc`}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{ fontSize: 12, color: "primary.main" }}
        >
          View on Discogs
        </Link>
        {/* Discogs' site shows shipping on top of the listing price. */}
        {hasPrice && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ lineHeight: 1.5 }}
          >
            excl. shipping
          </Typography>
        )}
      </CardActions>
    </Card>
  );
};

export default ReleaseCard;
