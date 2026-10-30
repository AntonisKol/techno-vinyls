import { Box, Card, CardActions, CardContent, Skeleton } from "@mui/material";
import { ARTWORK_SIZE, cardDetails, cardFrame } from "../ReleaseCard/cardFrame";

// A release card's shape while its release loads: artwork, title and year,
// catalogue number, price and the Discogs link.
const ReleaseCardSkeleton = () => (
  <Card data-testid="release-skeleton" aria-hidden="true" sx={cardFrame}>
    <CardContent
      sx={{ display: "flex", gap: 2, p: 2, "&:last-child": { pb: 2 } }}
    >
      <Skeleton
        variant="rectangular"
        animation="wave"
        width={ARTWORK_SIZE}
        height={ARTWORK_SIZE}
        sx={{ flex: `0 0 ${ARTWORK_SIZE}px` }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton animation="wave" width="90%" height={22} />
        <Skeleton animation="wave" width="60%" height={22} />
        <Skeleton animation="wave" width={40} height={16} />
      </Box>
    </CardContent>
    <CardContent sx={cardDetails}>
      <Skeleton animation="wave" width={90} height={20} />
      <Skeleton animation="wave" width={170} height={28} sx={{ mt: 1 }} />
    </CardContent>
    <CardActions sx={{ px: 2, pb: 2 }}>
      <Skeleton animation="wave" width={95} height={18} />
    </CardActions>
  </Card>
);

export default ReleaseCardSkeleton;
