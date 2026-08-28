import { createTheme } from "@mui/material/styles";

// Signature: a "night sky" identity — deep indigo-black background with an
// electric violet + cyan duo, evoking the cosmic "star" motif of the brand
// name rather than the default streaming red.
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7C4DFF",
      light: "#A47EFF",
      dark: "#5A32D6",
    },
    secondary: {
      main: "#22D3EE",
    },
    background: {
      default: "#0A0B14",
      paper: "#141626",
    },
    text: {
      secondary: "rgba(255,255,255,0.7)",
    },
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h1: { fontWeight: 800, letterSpacing: -0.5 },
    h2: { fontWeight: 800, letterSpacing: -0.5 },
    h3: { fontWeight: 800, letterSpacing: -0.5 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

export default theme;
