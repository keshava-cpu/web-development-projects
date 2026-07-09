import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ScrollToTop from "../components/ScrollToTop";

const FacultyRoute = ({
  authenticated,
  role,
  handleLogout,
  unreadCount,
  notificationsOpen,
  setNotificationsOpen,
  toggleNotifications,
  markAllNotificationsRead,
  notifications,
  notificationsRef,
  selectedEntryId,
  markNotificationRead,
  facultyProfile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [returnToAdmin, setReturnToAdmin] = useState(null);
  const profileMenuRef = useRef(null);

  const profileInitials = useMemo(
    () =>
      facultyProfile.displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join(""),
    [facultyProfile.displayName],
  );

  const isCreatePage = location.pathname === "/dashboard/create";
  const isListPage = location.pathname === "/dashboard";
  const isDetailPage =
    location.pathname.startsWith("/dashboard/entries/") &&
    !location.pathname.endsWith("/edit");

  const showAdminReturnButton =
    role === "admin" &&
    (location.pathname === "/dashboard" ||
      location.pathname.startsWith("/dashboard/") ||
      location.pathname === "/profile" ||
      location.pathname.startsWith("/profile"));

  const adminReturnPath = returnToAdmin || "/admin";

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
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
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

  useEffect(() => {
    const state = location.state;
    if (state?.returnTo) {
      const timeoutId = setTimeout(() => setReturnToAdmin(state.returnTo), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [location.state]);

  if (!authenticated) return <Navigate to="/login" replace />;
  if (role !== "faculty" && role !== "admin") return <Navigate to="/publications-tracker" replace />;

  const navTabs = [
    { label: "Dashboard", active: isListPage, onClick: () => navigate("/publications-tracker/dashboard") },
    { label: "Detail View", active: isDetailPage, onClick: handleDetailViewClick },
  ];

  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#FAFCFE", display: "flex", flexDirection: "column" }}>
      {/* Sticky header */}
      <Box sx={{ position: "sticky", top: 0, zIndex: 50 }}>
        {/* Top nav bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{ bgcolor: "#0B2D4D", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Toolbar sx={{ px: { xs: 2, sm: 2.5 }, minHeight: "52px !important", gap: 1, justifyContent: "space-between" }}>
            {/* Brand */}
            <Button
              onClick={() => navigate("/publications-tracker/dashboard")}
              disableRipple
              sx={{ textAlign: "left", p: 0, minWidth: 0, "&:hover": { opacity: 0.9, bgcolor: "transparent" } }}
            >
              <Box>
                <Typography variant="caption" sx={{ display: "block", textTransform: "uppercase", letterSpacing: "0.32em", color: "rgba(255,255,255,0.6)", fontSize: "0.6rem" }}>
                  College R&D
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "white", lineHeight: 1.2, fontSize: "0.95rem" }}>
                  Dashboard
                </Typography>
              </Box>
            </Button>

            {/* Right actions */}
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
              {/* Admin return button */}
              {showAdminReturnButton && (
                <Button
                  size="small"
                  startIcon={<ArrowBackIcon sx={{ fontSize: "1rem !important" }} />}
                  onClick={() => navigate(adminReturnPath)}
                  sx={{
                    border: "1px solid rgba(255,255,255,0.2)",
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
                    textTransform: "none",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    borderRadius: "20px",
                    px: 1.5,
                  }}
                >
                  Back to admin view
                </Button>
              )}

              {/* Notifications */}
              <Box ref={notificationsRef} sx={{ position: "relative" }}>
                <IconButton
                  aria-label={`Notifications (${unreadCount} unread)`}
                  onClick={toggleNotifications}
                  size="small"
                  sx={{ border: "1px solid rgba(255,255,255,0.2)", color: "white", transition: "background 0.15s", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
                >
                  <Badge badgeContent={unreadCount} color="error" max={99}>
                    <NotificationsOutlinedIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>

                {notificationsOpen && (
                  <Paper
                    id="notifications-panel"
                    role="dialog"
                    aria-label="Notifications"
                    elevation={8}
                    sx={{
                      position: "fixed",
                      left: { xs: 8, sm: "auto" },
                      right: { xs: 8, sm: 0 },
                      top: { xs: 64, sm: "auto" },
                      mt: { sm: 1 },
                      width: { xs: "auto", sm: 320 },
                      maxHeight: "70vh",
                      overflow: "hidden",
                      borderRadius: "16px",
                      zIndex: 60,
                      animation: "fadeIn 180ms ease-out",
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", gap: 1, borderBottom: "1px solid", borderColor: "divider", px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notifications</Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button size="small" onClick={markAllNotificationsRead} sx={{ textTransform: "none", color: "text.secondary", minWidth: "auto" }}>Mark all read</Button>
                        <Button size="small" onClick={() => setNotificationsOpen(false)} sx={{ textTransform: "none", minWidth: "auto" }}>Close</Button>
                      </Box>
                    </Box>
                    <List dense sx={{ p: 1, maxHeight: 256, overflowY: "auto" }} className="thin-scroll">
                      {notifications.length === 0 && (
                        <ListItem><Typography variant="body2" color="text.secondary">No notifications</Typography></ListItem>
                      )}
                      {notifications.map((n) => (
                        <ListItem key={n.id} disablePadding sx={{ mb: 0.25 }}>
                          <Box sx={{ display: "flex", width: "100%", gap: 1, borderRadius: "12px", p: 1, bgcolor: n.unread ? "#FAFCFE" : "transparent", alignItems: "flex-start", "&:hover": { bgcolor: "#F1F5F9" }, transition: "all 0.2s" }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{n.title}</Typography>
                                <Typography variant="caption" color="text.secondary">{n.createdAt}</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>{n.detail}</Typography>
                            </Box>
                            {n.unread && (
                              <Button size="small" onClick={() => markNotificationRead(n.id)} sx={{ textTransform: "none", minWidth: "auto", fontSize: "0.7rem", flexShrink: 0 }}>Mark</Button>
                            )}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>

              {/* Profile avatar menu */}
              <Box ref={profileMenuRef} sx={{ position: "relative" }}>
                <IconButton
                  onClick={() => setProfileMenuOpen((c) => !c)}
                  aria-label="Open user menu"
                  aria-expanded={profileMenuOpen}
                  size="small"
                  sx={{ border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "rgba(255,255,255,0.15)", fontSize: "0.7rem", fontWeight: 700, color: "white" }}>
                    {profileInitials || "F"}
                  </Avatar>
                </IconButton>

                {profileMenuOpen && (
                  <Paper
                    elevation={8}
                    sx={{
                      position: "fixed",
                      left: { xs: 8, sm: "auto" },
                      right: { xs: 8, sm: 0 },
                      top: { xs: 64, sm: "auto" },
                      mt: { sm: 1.5 },
                      width: { xs: "auto", sm: 256 },
                      borderRadius: "16px",
                      border: "1px solid #D9E2EC",
                      zIndex: 60,
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                      <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.25em", color: "text.secondary", fontWeight: 600, display: "block" }}>
                        Account
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600, color: "text.primary" }}>
                        {facultyProfile.displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{facultyProfile.email}</Typography>
                    </Box>
                    <List dense sx={{ py: 0.5 }}>
                      <ListItemButton
                        onClick={() => { setProfileMenuOpen(false); navigate("/publications-tracker/profile"); }}
                        sx={{ borderRadius: "10px", mx: 0.5, "&:hover": { bgcolor: "#EFF6FF", color: "#0077B6" } }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}><PersonOutlineIcon sx={{ fontSize: 18 }} /></ListItemIcon>
                        <ListItemText primary="My profile" primaryTypographyProps={{ variant: "body2", fontWeight: 500 }} />
                      </ListItemButton>
                      <ListItemButton
                        onClick={() => { setProfileMenuOpen(false); navigate("/publications-tracker/profile?section=directory"); }}
                        sx={{ borderRadius: "10px", mx: 0.5, "&:hover": { bgcolor: "#EFF6FF", color: "#0077B6" } }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}><PeopleOutlineIcon sx={{ fontSize: 18 }} /></ListItemIcon>
                        <ListItemText primary="People directory" primaryTypographyProps={{ variant: "body2", fontWeight: 500 }} />
                      </ListItemButton>
                      <Divider sx={{ my: 0.5 }} />
                      <ListItemButton
                        onClick={() => { setProfileMenuOpen(false); void handleLogout(); }}
                        sx={{ borderRadius: "10px", mx: 0.5, color: "error.main", "&:hover": { bgcolor: "#FEF2F2" } }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}><LogoutIcon sx={{ fontSize: 18, color: "error.main" }} /></ListItemIcon>
                        <ListItemText primary="Logout" primaryTypographyProps={{ variant: "body2", fontWeight: 500, color: "error.main" }} />
                      </ListItemButton>
                    </List>
                  </Paper>
                )}
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sub-nav tabs bar */}
        <Box sx={{ borderBottom: "1px solid #D9E2EC", bgcolor: "rgba(255,255,255,0.97)", backdropFilter: "blur(4px)" }}>
          <Box sx={{ mx: "auto", display: "flex", maxWidth: "100%", alignItems: "center", justifyContent: "space-between", gap: 1, overflowX: "auto", px: 2, py: 1 }}>
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
