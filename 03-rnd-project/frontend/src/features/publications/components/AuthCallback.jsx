/**
 * AuthCallback
 *
 * Handles the Google OAuth redirect for the Publications Tracker feature.
 * The backend redirects here with a short-lived JWT in the URL query string:
 *   /publications-tracker/auth-callback?token=<jwt>
 *
 * This component:
 *  1. Reads the temp token from the URL
 *  2. Calls POST /api/keshava/auth/finalize-session to set the HttpOnly cookie
 *  3. Invokes onLoginSuccess(userData) so PublicationsContext can update state
 *
 * Extracted from PublicationsApp.jsx (was inline at line 685).
 */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

function AuthCallback({ onLoginSuccess, token }) {
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const finalizeAndVerify = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tempToken = urlParams.get("token");
        if (!tempToken) throw new Error("No token provided in redirect URL");

        window.history.replaceState({}, document.title, window.location.pathname);

        const res = await fetch("/api/keshava/auth/finalize-session", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ token: tempToken }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.email) {
          onLoginSuccess(data);
          return;
        }
        if (res.status === 403 && data.error === "invalid_domain") {
          navigate("/publications-tracker/invalid-domain", { replace: true });
          return;
        }
        navigate("/publications-tracker", { replace: true });
      } catch (err) {
        console.error("Error verifying authentication session:", err);
        navigate("/publications-tracker", { replace: true });
      }
    };

    finalizeAndVerify();
  }, [onLoginSuccess, navigate, token]);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#FAFCFE",
        gap: 2,
      }}
    >
      <CircularProgress size={32} sx={{ color: "#005B96" }} />
      <Typography variant="body2" sx={{ fontWeight: 500, color: "#0B2D4D" }}>
        Completing secure login...
      </Typography>
    </Box>
  );
}

export default AuthCallback;
