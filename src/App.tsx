import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import ReleasesList from "./components/ReleasesList";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReleasesList />
    </ThemeProvider>
  );
};

export default App;
