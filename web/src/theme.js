import { createTheme } from "@mui/material/styles";

// Brand palette translated from tailwind.config.js
const brand = {
  950: "#0B2D4D",
  900: "#1F2933",
  800: "#005B96",
  700: "#0077B6",
  600: "#00A6C8",
  500: "#009688",
  400: "#C9A227",
};

const surface = {
  50: "#FAFCFE",
  100: "#F1F5F9",
  200: "#D9E2EC",
  300: "#C0CDD9",
};

const theme = createTheme({
  palette: {
    primary: {
      main: brand[700],
      dark: brand[800],
      light: brand[600],
      contrastText: "#ffffff",
    },
    secondary: {
      main: brand[500],
      contrastText: "#ffffff",
    },
    success: {
      main: "#16803C",
      light: "rgba(22,128,60,0.1)",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#D97706",
      light: "rgba(217,119,6,0.1)",
      contrastText: "#ffffff",
    },
    error: {
      main: "#B91C1C",
      light: "rgba(185,28,28,0.1)",
      contrastText: "#ffffff",
    },
    background: {
      default: surface[50],
      paper: "#ffffff",
    },
    text: {
      primary: brand[900],
      secondary: "#6B7280",
    },
    divider: surface[200],
    // Custom tokens exposed via theme.palette
    brand,
    surface,
  },
  typography: {
    fontFamily: [
      "Inter",
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12, // Base border radius (~rounded-xl)
  },
  shadows: [
    "none",
    "0 1px 2px rgba(11,45,77,0.04)",
    "0 2px 6px rgba(11,45,77,0.06)",
    "0 4px 12px rgba(11,45,77,0.08)",
    "0 10px 30px rgba(11,45,77,0.08)", // shadow-soft
    "0 10px 30px rgba(11,45,77,0.12)",
    "0 20px 40px rgba(11,45,77,0.12)",
    "0 20px 40px rgba(11,45,77,0.16)",
    "0 24px 48px rgba(11,45,77,0.16)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
    "0 32px 56px rgba(11,45,77,0.2)",
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "html, body, #root": { minHeight: "100%" },
        body: {
          margin: 0,
          minWidth: 320,
          overflowX: "hidden",
          backgroundColor: surface[50],
          color: brand[900],
        },
        "*": { boxSizing: "border-box" },
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(-4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 50, // rounded-full for most buttons
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#ffffff",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: brand[700],
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: brand[700],
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { fontSize: "0.875rem" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${surface[200]}`,
          borderRadius: 20,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "0.7rem",
          height: 26,
          borderRadius: 50,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          minHeight: 40,
        },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
});

export default theme;
