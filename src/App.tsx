import {
  Box,
  styled,
  ThemeProvider,
  CssBaseline,
  ScopedCssBaseline,
} from "@mui/material";
import theme from "./theme";
import ReleasesList from "./components/ReleasesList";

const StyledApp = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

const StyledNavigation = styled("header")(({ theme }) => ({
  display: "flex",
  width: "min(1120px, calc(100% - 36px))",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 24,
  margin: "0 auto",
  padding: "21px 0",
  borderBottom: `1px solid ${theme.palette.divider}`,
  "@media (max-width: 760px)": {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 13,
  },
}));

const StyledBrand = styled("a")(({ theme }) => ({
  display: "inline-flex",
  flex: "0 0 auto",
  color: theme.palette.text.primary,
  textDecoration: "none",
  "& svg": {
    display: "block",
    width: 192,
    height: "auto",
  },
  "& text": {
    fill: "currentColor",
    fontFamily: theme.typography.fontFamily,
  },
  "& g": {
    fill: "currentColor",
  },
  "@media (max-width: 520px)": {
    "& svg": {
      width: 170,
    },
  },
}));

const StyledNavLinks = styled("nav")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: "10px 18px",
  fontFamily: '"Share Tech Mono", ui-monospace, monospace',
  fontSize: 12,
  lineHeight: "normal",
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
  "@media (max-width: 760px)": {
    justifyContent: "flex-start",
  },
  "@media (max-width: 520px)": {
    gap: "8px 15px",
  },
}));

const StyledFooter = styled("footer")(({ theme }) => ({
  width: "min(1120px, calc(100% - 36px))",
  margin: "auto auto 0",
  padding: "18px 0 24px",
  borderTop: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  fontFamily: '"Share Tech Mono", ui-monospace, monospace',
  fontSize: 10,
}));

const SiteNavigation = () => (
  <StyledNavigation>
    <StyledBrand href="/" aria-label="ADNS Audio home">
      <svg viewBox="0 0 240 48" role="img" aria-labelledby="brand-title">
        <title id="brand-title">ADNS Audio</title>
        <text x="0" y="35" fontSize="31" fontWeight="700" letterSpacing="1">
          ADNS Audio
        </text>
        <g>
          <rect x="197" y="22" width="2.5" height="7" rx="1.25" />
          <rect x="203" y="18" width="2.5" height="15" rx="1.25" />
          <rect x="209" y="13" width="2.5" height="25" rx="1.25" />
          <rect x="215" y="20" width="2.5" height="11" rx="1.25" />
          <rect x="221" y="15" width="2.5" height="21" rx="1.25" />
          <rect x="227" y="20" width="2.5" height="11" rx="1.25" />
          <rect x="233" y="22" width="2.5" height="7" rx="1.25" />
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

// embedded: inside the Techno Vinyls page on adnsaudio.com, which has the
// site's navigation, heading and footer, and whose styles must stay as they are.
const App = ({ embedded = false }: { embedded?: boolean }) => {
  if (embedded) {
    return (
      <ThemeProvider theme={theme}>
        <ScopedCssBaseline sx={{ bgcolor: "transparent" }}>
          <ReleasesList embedded />
        </ScopedCssBaseline>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledApp>
        <SiteNavigation />
        <ReleasesList />
        <StyledFooter>© Antonios Kolovos. All rights reserved.</StyledFooter>
      </StyledApp>
    </ThemeProvider>
  );
};

export default App;
