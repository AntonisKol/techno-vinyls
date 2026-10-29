import { Box, styled, Typography } from "@mui/material";

export const StyledContainer = styled(Box)(() => ({
  width: "min(1200px, calc(100% - 32px))",
  minHeight: "100vh",
  margin: "0 auto",
  padding: "clamp(28px, 6vw, 72px) 0 clamp(56px, 8vw, 96px)",
}));

export const StyledHeader = styled(Typography)(() => ({
  margin: 0,
  fontWeight: 700,
  fontSize: "clamp(40px, 7vw, 76px)",
  lineHeight: 1,
  letterSpacing: "-.045em",
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
