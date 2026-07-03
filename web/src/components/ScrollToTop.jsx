import { useState, useEffect } from "react";
import Fab from "@mui/material/Fab";
import Zoom from "@mui/material/Zoom";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Zoom in={isVisible}>
      <Fab
        onClick={scrollToTop}
        aria-label="Scroll to top"
        size="medium"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 50,
          bgcolor: "primary.main",
          color: "white",
          "&:hover": { bgcolor: "primary.dark" },
          boxShadow: 4,
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
}
