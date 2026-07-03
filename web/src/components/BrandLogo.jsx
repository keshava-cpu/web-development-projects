import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function BrandLogo({
  title = "College R&D",
  subtitle = "Research & Publications",
  compact = false,
  className = "",
  textClassName = "",
  iconClassName = "",
}) {
  return (
    <Box
      className={className}
      sx={{ display: "flex", alignItems: "center", gap: 2 }}
    >
      {/* Logo icon box */}
      <Box
        className={iconClassName}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: "16px",
          bgcolor: "rgb(15 23 42)", // slate-900 fallback
          color: "white",
          boxShadow: 2,
          flexShrink: 0,
          // iconClassName can override bgcolor/color via sx cascade
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          style={{ width: 40, height: 40 }}
          fill="none"
        >
          {/* Elegant geometric R&D path layout */}
          <path
            d="M16 46V18h12c5 0 9 3 9 7.5S33 33 28 33h-12"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25 33l11 13"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M38 18v28c8 0 13-5 13-14s-5-14-13-14z"
            stroke="#38bdf8"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>

      {!compact && (
        <Box className={textClassName}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {subtitle}
          </Typography>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "white",
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
