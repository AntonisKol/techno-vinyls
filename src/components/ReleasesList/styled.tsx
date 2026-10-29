import { Box, styled, Typography } from "@mui/material";

export const StyledContainer = styled(Box)(() => ({
  flex: "1 0 auto",
  width: "min(1120px, calc(100% - 36px))",
  minHeight: 0,
  margin: "0 auto",
  padding: "clamp(56px, 9vw, 104px) 0 clamp(56px, 8vw, 96px)",
  "@media (max-width: 760px)": {
    paddingTop: 55,
  },
}));

export const StyledHeader = styled(Typography)(() => ({
  margin: 0,
  fontWeight: 700,
  fontSize: "clamp(28px, 5vw, 40px)",
  lineHeight: 1.1,
  letterSpacing: ".14em",
}));

export const StyledAppDescription = styled(Typography)(({ theme }) => ({
  maxWidth: 720,
  margin: "18px 0 28px",
  paddingLeft: 16,
  borderLeft: `2px solid ${theme.palette.primary.main}`,
  color: theme.palette.text.secondary,
  fontSize: 16,
  lineHeight: 1.65,
}));

export const StyledCatalogueInfo = styled(Typography)(({ theme }) => ({
  display: "block",
  marginTop: -14,
  marginBottom: 24,
  color: theme.palette.text.secondary,
  lineHeight: 1.5,
}));

export const StyledReleaseGrid = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
  gap: 12,
  marginTop: 24,
  marginBottom: 24,
}));

export const StyledButtonsContainer = styled(Box)(() => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: 16,
  marginTop: 32,
}));

export const StyledStatus = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 8,
  marginTop: 20,
  padding: "12px 14px",
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
}));
