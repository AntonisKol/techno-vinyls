import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#07080b",
      paper: "#111318",
    },
    text: {
      primary: "#eceef2",
      secondary: "#9aa0ad",
    },
    primary: {
      main: "#a0c2a7",
      contrastText: "#07080b",
    },
    divider: "#30343b",
  },
  shape: {
    borderRadius: 2,
  },
  typography: {
    fontFamily: '"Chakra Petch", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: "none",
    },
  },
});

export default theme;
