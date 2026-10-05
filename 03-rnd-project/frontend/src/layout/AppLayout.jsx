import { Outlet, useLocation } from "react-router-dom";
import { Box, Container } from "@mui/material";
import TopNavbar from "./TopNavbar";
import { colors } from "../theme/colors";

const AppLayout = () => {
  const location = useLocation();

  // 1. Detect if the user is on your sub-app pages
  const isPublicationsTracker = location.pathname.includes(
    "publications-tracker",
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.softWhite }}>
      <TopNavbar />
      <Box
        component="main"
        sx={{
          bgcolor: colors.researchGray,
          minHeight: "calc(100vh - 72px)",
          // 2. Apply vertical padding to all pages EXCEPT yours
          py: isPublicationsTracker ? 0 : 4,
        }}
      >
        {/* 3. Disable max-width restrictions entirely when rendering your tracker */}
        <Container
          maxWidth={isPublicationsTracker ? false : "xl"}
          disableGutters={isPublicationsTracker}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
