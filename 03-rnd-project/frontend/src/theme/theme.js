import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

const theme = createTheme({
  palette: {
    primary: {
      main: colors.academicBlue,
      dark: colors.midnightBlue,
      light: colors.strongBlue,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.innovationCyan,
      contrastText: colors.white,
    },
    success: {
      main: colors.emerald,
    },
    warning: {
      main: colors.amber,
    },
    error: {
      main: colors.professionalRed,
    },
    text: {
      primary: colors.graphite,
      secondary: colors.slateGray,
    },
    background: {
      default: colors.softWhite,
      paper: colors.white,
    },
    divider: colors.lightSteel,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: colors.midnightBlue,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 600,
      color: colors.midnightBlue,
    },
    h6: {
      fontWeight: 600,
      color: colors.midnightBlue,
    },
    subtitle1: {
      fontWeight: 500,
      color: colors.slateGray,
    },
    subtitle2: {
      fontWeight: 500,
      color: colors.coolGray,
    },
    body1: {
      color: colors.slateGray,
      lineHeight: 1.6,
    },
    body2: {
      color: colors.coolGray,
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: colors.academicBlue,
          "&:hover": {
            backgroundColor: colors.strongBlue,
          },
        },
        outlinedPrimary: {
          borderColor: colors.academicBlue,
          color: colors.academicBlue,
          "&:hover": {
            borderColor: colors.strongBlue,
            backgroundColor: "rgba(0, 91, 150, 0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `none`, // Border is put to none
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.lightSteel}`,
          boxShadow: "0 1px 3px rgba(11, 45, 77, 0.06)",
        },
      },
    },
  },
});

export default theme;
