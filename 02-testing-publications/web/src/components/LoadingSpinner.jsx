import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export default function LoadingSpinner({ size = 20, className = "", color = "inherit" }) {
  return (
    <Box
      component="span"
      className={className}
      sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
    >
      <CircularProgress size={size} color={color} thickness={4} />
    </Box>
  );
}
