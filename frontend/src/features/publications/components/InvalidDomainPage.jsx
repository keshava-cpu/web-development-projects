/**
 * InvalidDomainPage
 *
 * Shown when a user authenticates via Google OAuth but their email domain
 * is not in the ALLOWED_EMAIL_DOMAIN allowlist.
 *
 * Extracted from PublicationsApp.jsx (was inline at line 752).
 */
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

function InvalidDomainPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#F1F5F9",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 448,
          p: 4,
          textAlign: "center",
          borderRadius: "16px",
        }}
      >
        <Box
          sx={{
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: "#fee2e2",
            color: "#b91c1c",
            mb: 2,
          }}
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            style={{ width: 24, height: 24 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Invalid Email Domain
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your organization account is not authorized to access this platform.
          Please log in using an approved institutional email address.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate("/publications-tracker", { replace: true })}
          sx={{
            mt: 3,
            bgcolor: "#0077B6",
            "&:hover": { bgcolor: "#005B96" },
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Back to Publications Tracker
        </Button>
      </Card>
    </Box>
  );
}

export default InvalidDomainPage;
