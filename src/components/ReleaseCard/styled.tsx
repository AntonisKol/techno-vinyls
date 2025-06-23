import {
  Box,
  Card,
  Link,
  Typography,
  CircularProgress,
  styled,
} from "@mui/material";

export const StyledCard = styled(Card)(() => ({
  color: "text.primary",
  borderRadius: 16,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 16,
  gap: 32,
  transition: "transform 0.1s",
  "&:hover": {
    transform: "scale(1.02)",
  },
}));

export const StyledCardContent = styled(Box)(() => ({
  flexGrow: 1,
  textAlign: "center",
}));

export const StyledCoverImage = styled("img")(() => ({
  width: 100,
  height: 100,
  borderRadius: "50%",
  objectFit: "cover",
  marginBottom: 20,
  boxShadow: "0 0 8px #000",
}));

export const StyledTitle = styled(Typography)(() => ({
  lineHeight: 1,
  fontWeight: 800,
}));

export const StyledInfoWrapper = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100%",
  alignItems: "center",
  gap: 6,
}));

export const StyledDetailsText = styled(Typography)(() => ({
  fontSize: 12,
}));

export const StyledPriceText = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  fontWeight: 800,
  color: theme.palette.mode,
}));

export const StyledLoader = styled(CircularProgress)(() => ({
  marginTop: 4,
}));

export const StyledDiscogsLink = styled(Link)(() => ({
  fontSize: 12,
}));
