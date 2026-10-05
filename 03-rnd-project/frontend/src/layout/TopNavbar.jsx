import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import Badge from "@mui/material/Badge";
import Paper from "@mui/material/Paper";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ListItemText from "@mui/material/ListItemText";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useState, useRef, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { usePublications } from "../features/publications/context/PublicationsContext";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Funded Projects", path: "/projects" },
  { label: "Publications Tracker", path: "/publications-tracker/dashboard" },
  { label: "Patents", path: "/patents" },
  { label: "Consultancy", path: "/consultancy" },
  { label: "Reports", path: "/reports" },
];

const TopNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  // console.log("location:", location);
  const {
    unreadCount,
    notificationsOpen,
    setNotificationsOpen,
    toggleNotifications,
    markAllNotificationsRead,
    notifications,
    notificationsRef,
    markNotificationRead,
    facultyProfile,
  } = usePublications();

  const isPublicationsTracker = location.pathname.includes(
    "publications-tracker",
  );

  const isAdmin = user?.role == "Admin";

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
  // ── Profile menu click-outside + keyboard close ─────────────────────────────
  useEffect(() => {
    function handleClick(e) {
      if (!profileMenuOpen) return;
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setProfileMenuOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") setProfileMenuOpen(false);
    }

    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [profileMenuOpen]);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout(); // clears localStorage + calls POST /api/auth/logout (cookie clear)
    navigate("/login", { replace: true });
  };

  console.log("user role:", user.role);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: colors.midnightBlue,
        borderBottom: "none",
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: 72 }}>
        <ScienceOutlinedIcon
          sx={{ color: colors.innovationCyan, fontSize: 28 }}
        />
        <Typography
          variant="h6"
          sx={{ color: colors.white, fontWeight: 700, mr: 2 }}
        >
          R&D Management
        </Typography>

        <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={NavLink}
              to={
                user?.role == "Admin" && item.label == "Publications Tracker"
                  ? "/publications-tracker/admin"
                  : item.path
              }
              end={item.path === "/"}
              sx={{
                color: colors.white,
                px: 2,
                py: 1,
                borderRadius: 1,
                position: "relative",
                "&.active::after": {
                  content: '""',
                  position: "absolute",
                  left: 12,
                  right: 12,
                  bottom: 4,
                  height: 3,
                  borderRadius: 2,
                  bgcolor: colors.innovationCyan,
                },
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Right Actions Container */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {isPublicationsTracker ? (
            /* =========================================================
               YOUR PROFILE & NOTIFICATION PANEL LAYOUT (ACTIVE)
               ========================================================= */
            <>
              {/* Admin return button */}
              {isAdmin &&
                !location.pathname.includes("/publications-tracker/admin") && (
                  <Button
                    size="small"
                    startIcon={
                      <ArrowBackIcon sx={{ fontSize: "1rem !important" }} />
                    }
                    onClick={() =>
                      navigate(
                        location.state?.returnTo ||
                          "/publications-tracker/admin",
                      )
                    }
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

              {/* Notifications Wrapper */}
              <Box ref={notificationsRef} sx={{ position: "relative" }}>
                <IconButton
                  aria-label={`Notifications (${unreadCount} unread)`}
                  onClick={toggleNotifications}
                  size="small"
                  sx={{
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                    transition: "background 0.15s",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Badge badgeContent={unreadCount} color="error" max={99}>
                    <NotificationsOutlinedIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>

                {/* Notifications Dropdown Panel */}
                {notificationsOpen && (
                  <Paper
                    id="notifications-panel"
                    role="dialog"
                    aria-label="Notifications"
                    elevation={8}
                    sx={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      mt: 1.5,
                      width: { xs: "280px", sm: 320 },
                      maxHeight: "70vh",
                      overflow: "hidden",
                      borderRadius: "16px",
                      zIndex: 1200,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { sm: "center" },
                        justifyContent: "space-between",
                        gap: 1,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        px: 2,
                        py: 1.5,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Notifications
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          onClick={markAllNotificationsRead}
                          sx={{
                            textTransform: "none",
                            color: "text.secondary",
                            minWidth: "auto",
                          }}
                        >
                          Mark all read
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setNotificationsOpen(false)}
                          sx={{ textTransform: "none", minWidth: "auto" }}
                        >
                          Close
                        </Button>
                      </Box>
                    </Box>
                    <List
                      dense
                      sx={{ p: 1, maxHeight: 256, overflowY: "auto" }}
                      className="thin-scroll"
                    >
                      {notifications.length === 0 && (
                        <ListItem>
                          <Typography variant="body2" color="text.secondary">
                            No notifications
                          </Typography>
                        </ListItem>
                      )}
                      {notifications.map((n) => (
                        <ListItem key={n.id} disablePadding sx={{ mb: 0.25 }}>
                          <Box
                            sx={{
                              display: "flex",
                              width: "100%",
                              gap: 1,
                              borderRadius: "12px",
                              p: 1,
                              bgcolor: n.unread ? "#FAFCFE" : "transparent",
                              alignItems: "flex-start",
                              "&:hover": { bgcolor: "#F1F5F9" },
                              transition: "all 0.2s",
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {n.title}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {n.createdAt}
                                </Typography>
                              </Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 0.25 }}
                              >
                                {n.detail}
                              </Typography>
                            </Box>
                            {n.unread && (
                              <Button
                                size="small"
                                onClick={() => markNotificationRead(n.id)}
                                sx={{
                                  textTransform: "none",
                                  minWidth: "auto",
                                  fontSize: "0.7rem",
                                  flexShrink: 0,
                                }}
                              >
                                Mark
                              </Button>
                            )}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>

              {/* Your Profile Avatar menu wrapper */}
              <Box ref={profileMenuRef} sx={{ position: "relative" }}>
                <IconButton
                  onClick={() => setProfileMenuOpen((c) => !c)}
                  aria-label="Open user menu"
                  aria-expanded={profileMenuOpen}
                  size="small"
                  sx={{ border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "rgba(255,255,255,0.15)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {profileInitials || "F"}
                  </Avatar>
                </IconButton>

                {/* Your Custom Account Info Paper overlay */}
                {profileMenuOpen && (
                  <Paper
                    elevation={8}
                    sx={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      mt: 1.5,
                      width: 256,
                      borderRadius: "16px",
                      border: "1px solid #D9E2EC",
                      zIndex: 1200,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.25em",
                          color: "text.secondary",
                          fontWeight: 600,
                          display: "block",
                        }}
                      >
                        Account
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, fontWeight: 600, color: "text.primary" }}
                      >
                        {facultyProfile.displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {facultyProfile.email}
                      </Typography>
                    </Box>
                    <List dense sx={{ py: 0.5 }}>
                      <ListItemButton
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/publications-tracker/profile");
                        }}
                        sx={{
                          borderRadius: "10px",
                          mx: 0.5,
                          "&:hover": { bgcolor: "#EFF6FF", color: "#0077B6" },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <PersonOutlineIcon sx={{ fontSize: 18 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="My profile"
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: 500,
                          }}
                        />
                      </ListItemButton>

                      <ListItemButton
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate(
                            "/publications-tracker/profile?section=directory",
                          );
                        }}
                        sx={{
                          borderRadius: "10px",
                          mx: 0.5,
                          "&:hover": { bgcolor: "#EFF6FF", color: "#0077B6" },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <PeopleOutlineIcon sx={{ fontSize: 18 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="People directory"
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: 500,
                          }}
                        />
                      </ListItemButton>

                      <Divider sx={{ my: 0.5 }} />

                      <ListItemButton
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        sx={{
                          borderRadius: "10px",
                          mx: 0.5,
                          color: "error.main",
                          "&:hover": { bgcolor: "#FEF2F2" },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <LogoutIcon
                            sx={{ fontSize: 18, color: "error.main" }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Logout"
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: 500,
                            color: "error.main",
                          }}
                        />
                      </ListItemButton>
                    </List>
                  </Paper>
                )}
              </Box>
            </>
          ) : (
            <>
              <IconButton
                onClick={(event) => setAnchorEl(event.currentTarget)}
                sx={{ p: 0 }}
              >
                <Avatar
                  sx={{
                    bgcolor: colors.innovationCyan,
                    color: colors.midnightBlue,
                    width: 40,
                    height: 40,
                    fontWeight: 700,
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
              </IconButton>
            </>
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box sx={{ px: 2, py: 1.5, minWidth: 220 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: colors.graphite, fontWeight: 700 }}
            >
              {user?.name || "Research User"}
            </Typography>
            <Typography variant="body2">{user?.email}</Typography>
            <Typography variant="caption" sx={{ color: colors.coolGray }}>
              Role: {user?.role || "Faculty"}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;
