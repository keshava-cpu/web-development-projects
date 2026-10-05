import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
// import AppBar from "@mui/material/AppBar";
// import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
// import IconButton from "@mui/material/IconButton";
// import Badge from "@mui/material/Badge";
// import Avatar from "@mui/material/Avatar";
// import Paper from "@mui/material/Paper";
// import List from "@mui/material/List";
// import ListItem from "@mui/material/ListItem";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemIcon from "@mui/material/ListItemIcon";
// import ListItemText from "@mui/material/ListItemText";
// import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
// import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
// import PeopleOutlineIcon from "@mui/icons-material/PeopleOutlined";
// import LogoutIcon from "@mui/icons-material/Logout";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ScrollToTop from "../components/ScrollToTop";

const FacultyRoute = ({
  authenticated,
  role,
  // handleLogout,
  // unreadCount,
  // notificationsOpen,
  // setNotificationsOpen,
  // toggleNotifications,
  // markAllNotificationsRead,
  // notifications,
  // notificationsRef,
  selectedEntryId,
  // markNotificationRead,
  // facultyProfile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  // const [returnToAdmin, setReturnToAdmin] = useState(null);
  const profileMenuRef = useRef(null);

  // const profileInitials = useMemo(
  //   () =>
  //     facultyProfile.displayName
  //       .split(" ")
  //       .filter(Boolean)
  //       .slice(0, 2)
  //       .map((part) => part[0]?.toUpperCase() ?? "")
  //       .join(""),
  //   [facultyProfile.displayName],
  // );

  const isCreatePage = location.pathname === "/dashboard/create";
  const isListPage = location.pathname === "/dashboard";
  const isDetailPage =
    location.pathname.startsWith("/dashboard/entries/") &&
    !location.pathname.endsWith("/edit");

  // const showAdminReturnButton =
  //   role === "admin" &&
  //   (location.pathname === "/dashboard" ||
  //     location.pathname.startsWith("/dashboard/") ||
  //     location.pathname === "/profile" ||
  //     location.pathname.startsWith("/profile"));

  // const adminReturnPath = returnToAdmin || "/admin";

  const handleDetailViewClick = () => {
    if (selectedEntryId) {
      navigate(`/publications-tracker/dashboard/entries/${selectedEntryId}`);
    } else {
      alert("Please select an entry from the list tracking system first!");
    }
  };

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!profileMenuOpen) return;
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") setProfileMenuOpen(false);
    }
    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);

  // useEffect(() => {
  //   const state = location.state;
  //   if (state?.returnTo) {
  //     const timeoutId = setTimeout(() => setReturnToAdmin(state.returnTo), 0);
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [location.state]);

  if (!authenticated) return <Navigate to="/login" replace />;
  if (role !== "faculty" && role !== "admin")
    return <Navigate to="/publications-tracker" replace />;

  const navTabs = [
    {
      label: "Dashboard",
      active: isListPage,
      onClick: () => navigate("/publications-tracker/dashboard"),
    },
    {
      label: "Detail View",
      active: isDetailPage,
      onClick: handleDetailViewClick,
    },
  ];

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: "#FAFCFE",
        display: "flex",
        flexDirection: "column",
        // Allows absolute/sticky calculations to scale properly against the document body
        position: "relative",
      }}
    >
      {/* Sticky header container */}
      <Box
        sx={{
          position: "sticky",
          // Changed from 0 to 72px so it stacks perfectly under your friend's TopNavbar
          top: 65,
          zIndex: 50,
        }}
      >
        {/* Sub nav bar styling */}
        <Box
          sx={{
            borderBottom: "1px solid #D9E2EC",
            bgcolor: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Box
            sx={{
              mx: "auto",
              display: "flex",
              maxWidth: "100%",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              overflowX: "auto",
              px: 2,
              py: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {navTabs.map((tab) => (
                <Chip
                  key={tab.label}
                  label={tab.label}
                  onClick={tab.onClick}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    bgcolor: tab.active ? "#0B2D4D" : "#F1F5F9",
                    color: tab.active ? "white" : "#0B2D4D",
                    "&:hover": { bgcolor: tab.active ? "#005B96" : "#D9E2EC" },
                    height: 30,
                    whiteSpace: "nowrap",
                  }}
                />
              ))}
            </Box>
            <Chip
              label="Create Entry"
              onClick={() => navigate("/publications-tracker/dashboard/create")}
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                cursor: "pointer",
                bgcolor: isCreatePage ? "#0B2D4D" : "#F1F5F9",
                color: isCreatePage ? "white" : "#0B2D4D",
                "&:hover": { bgcolor: isCreatePage ? "#005B96" : "#D9E2EC" },
                height: 30,
                whiteSpace: "nowrap",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Page content */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Outlet />
      </Box>

      <ScrollToTop />
    </Box>
  );
};

export default FacultyRoute;
