import { Navigate, NavLink, Outlet } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/review", label: "Review queue" },
  { to: "/admin/publications", label: "Publications" },
  { to: "/admin/users", label: "User directory" },
];

export default function AdminRoute({
  authenticated,
  role,
  handleLogout,
  unreadCount,
  notificationsOpen,
  setNotificationsOpen,
  toggleNotifications,
  markAllNotificationsRead,
  notifications,
  markNotificationRead,
  notificationsRef,
}) {
  const location = useLocation();
  const activeIdx = NAV_ITEMS.findIndex((item) =>
    location.pathname === item.to || location.pathname.startsWith(item.to + "/")
  );

  if (!authenticated) return <Navigate to="/" replace />;
  if (role !== "admin") return <Navigate to="/error" replace />;

  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#FAFCFE" }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: "#0B2D4D", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Toolbar sx={{ gap: 2, justifyContent: "space-between", px: { xs: 2, sm: 3 }, minHeight: "56px !important" }}>
          <Box>
            <Typography variant="caption" sx={{ display: "block", textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.6)", fontSize: "0.6rem" }}>
              College R&D
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "white", lineHeight: 1.2 }}>
              Admin Panel
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Notifications */}
            <Box ref={notificationsRef} sx={{ position: "relative" }}>
              <IconButton
                aria-label={`Notifications (${unreadCount} unread)`}
                onClick={toggleNotifications}
                size="small"
                sx={{ border: "1px solid rgba(255,255,255,0.2)", color: "white" }}
              >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsOutlinedIcon fontSize="small" />
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
                    overflow: "auto",
                    borderRadius: "16px",
                    zIndex: 60,
                    animation: "fadeIn 180ms ease-out",
                  }}
                  className="thin-scroll"
                >
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", gap: 1, borderBottom: "1px solid", borderColor: "divider", px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notifications</Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button size="small" onClick={markAllNotificationsRead} sx={{ textTransform: "none", color: "text.secondary", minWidth: "auto" }}>Mark all read</Button>
                      <Button size="small" onClick={() => setNotificationsOpen(false)} sx={{ textTransform: "none", minWidth: "auto" }}>Close</Button>
                    </Box>
                  </Box>
                  <List dense sx={{ p: 1, maxHeight: 256 }} className="thin-scroll">
                    {notifications.length === 0 && (
                      <ListItem><Typography variant="body2" color="text.secondary">No notifications</Typography></ListItem>
                    )}
                    {notifications.map((n) => (
                      <ListItem key={n.id} sx={{ gap: 1, borderRadius: "12px", bgcolor: n.unread ? "#FAFCFE" : "transparent", "&:hover": { bgcolor: "#F1F5F9", transform: "translateY(-1px)" }, transition: "all 0.2s", alignItems: "flex-start" }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{n.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{n.createdAt}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>{n.detail}</Typography>
                        </Box>
                        {n.unread && (
                          <Button size="small" onClick={() => markNotificationRead(n.id)} sx={{ textTransform: "none", minWidth: "auto", fontSize: "0.7rem" }}>Mark</Button>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<LogoutIcon sx={{ fontSize: "1rem !important" }} />}
              onClick={handleLogout}
              sx={{ borderColor: "rgba(255,255,255,0.3)", color: "white", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" }, textTransform: "none", borderRadius: "20px" }}
            >
              Sign out
            </Button>
          </Box>
        </Toolbar>

        {/* Navigation tabs */}
        <Box sx={{ bgcolor: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.1)", px: { xs: 1, sm: 2 } }}>
          <Tabs
            value={activeIdx >= 0 ? activeIdx : false}
            TabIndicatorProps={{ style: { backgroundColor: "white" } }}
            sx={{ minHeight: 44 }}
          >
            {NAV_ITEMS.map((item, i) => (
              <Tab
                key={item.to}
                label={item.label}
                component={NavLink}
                to={item.to}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  "&.Mui-selected": { color: "white" },
                  "&:hover": { color: "white" },
                  minHeight: 44,
                  fontSize: "0.8rem",
                  px: 2,
                }}
              />
            ))}
          </Tabs>
        </Box>
      </AppBar>

      {/* Page content */}
      <Box sx={{ mx: "auto", maxWidth: 1280, p: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
