import { Box, styled, ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import ReleasesList from "./components/ReleasesList";

const StyledApp = styled(Box)(() => ({
  minHeight: "100vh",
}));

const StyledNavigation = styled("header")(({ theme }) => ({
  display: "flex",
  width: "min(1200px, calc(100% - 32px))",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 24,
  margin: "0 auto",
  padding: "21px 0",
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down("md")]: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 16,
  },
}));

const StyledBrand = styled("a")(({ theme }) => ({
  display: "inline-flex",
  flex: "0 0 auto",
  color: theme.palette.text.primary,
  textDecoration: "none",
  "& svg": {
    display: "block",
    width: 248,
    height: "auto",
  },
  "& text": {
    fill: "currentColor",
    fontFamily: theme.typography.fontFamily,
  },
  "& g": {
    fill: "currentColor",
  },
}));

const StyledNavLinks = styled("nav")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: "10px 18px",
  fontFamily: "monospace",
  fontSize: 12,
  letterSpacing: ".07em",
  textTransform: "uppercase",
  "& a": {
    color: theme.palette.text.secondary,
    textDecoration: "none",
    "&:hover, &[aria-current='page']": {
      color: theme.palette.text.primary,
    },
    "&:focus-visible": {
      outline: `3px solid ${theme.palette.primary.main}`,
      outlineOffset: 4,
    },
  },
  [theme.breakpoints.down("md")]: {
    justifyContent: "flex-start",
  },
  [theme.breakpoints.down("sm")]: {
    gap: "8px 15px",
  },
}));

const SiteNavigation = () => (
  <StyledNavigation>
    <StyledBrand href="/" aria-label="ADNS Audio home">
      <svg viewBox="0 0 310 48" role="img" aria-labelledby="brand-title">
        <title id="brand-title">ADNS Audio</title>
        <text x="0" y="35" fontSize="31" fontWeight="700" letterSpacing="1">
          ADNS Audio
        </text>
        <g>
          <rect x="225" y="22" width="2.5" height="7" rx="1.25" />
          <rect x="231" y="18" width="2.5" height="15" rx="1.25" />
          <rect x="237" y="13" width="2.5" height="25" rx="1.25" />
          <rect x="243" y="20" width="2.5" height="11" rx="1.25" />
          <rect x="249" y="15" width="2.5" height="21" rx="1.25" />
          <rect x="255" y="20" width="2.5" height="11" rx="1.25" />
          <rect x="261" y="22" width="2.5" height="7" rx="1.25" />
        </g>
      </svg>
    </StyledBrand>
    <StyledNavLinks aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/space/">ADNS SPACE</a>
      <a href="/techno-vinyls/" aria-current="page">
        Techno Vinyls
      </a>
      <a href="/market-trends/">Market Trends</a>
    </StyledNavLinks>
  </StyledNavigation>
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledApp>
        <SiteNavigation />
      <ReleasesList />
      </StyledApp>
    </ThemeProvider>
  );
};

export default App;
