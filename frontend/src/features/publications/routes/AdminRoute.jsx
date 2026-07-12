import { Navigate, NavLink, Outlet } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
// import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
// import IconButton from "@mui/material/IconButton";
// import Badge from "@mui/material/Badge";
// import Paper from "@mui/material/Paper";
// import List from "@mui/material/List";
// import ListItem from "@mui/material/ListItem";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
// import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
// import LogoutIcon from "@mui/icons-material/Logout";
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
  // handleLogout,
  // unreadCount,
  // notificationsOpen,
  // setNotificationsOpen,
  // toggleNotifications,
  // markAllNotificationsRead,
  // notifications,
  // markNotificationRead,
  // notificationsRef,
}) {
  const location = useLocation();
  const activeIdx = NAV_ITEMS.findIndex(
    (item) =>
      location.pathname === item.to ||
      location.pathname.startsWith(item.to + "/"),
  );

  if (!authenticated) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/publications-tracker" replace />;

  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#FAFCFE" }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#0B2D4D",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          zIndex: 1000,
        }}
      >
        {/* Navigation tabs */}
        <Box
          sx={{
            bgcolor: "rgba(0,0,0,0.2)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            px: { xs: 1, sm: 2 },
          }}
        >
          <Tabs
            value={activeIdx >= 0 ? activeIdx : false}
            TabIndicatorProps={{ style: { backgroundColor: "white" } }}
            sx={{ minHeight: 44 }}
          >
            {NAV_ITEMS.map((item) => (
              <Tab
                key={item.to}
                label={item.label}
                component={NavLink}
                to={"/publications-tracker" + item.to}
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
