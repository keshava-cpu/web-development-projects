import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import BrandLogo from "@/components/BrandLogo";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LoginPage({
  handleSignIn,
  handleMockSignIn,
  notificationsRef,
  notificationsOpen,
  setNotificationsOpen,
  unreadCount,
  toggleNotifications,
  markAllNotificationsRead,
  notifications,
  markNotificationRead,
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const onGoogleClick = () => {
    setIsRedirecting(true);
    handleSignIn();
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#D9E2EC",
        px: { xs: 2, sm: 3 },
        py: 3,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 400,
          borderRadius: "28px",
          border: "1px solid #D9E2EC",
          boxShadow: "0 10px 30px rgba(11,45,77,0.08)",
          p: { xs: 3, sm: 4 },
          textAlign: "center",
        }}
      >
        {/* Logo row with notifications button */}
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box
            sx={{
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "24px",
              px: 2.5,
              py: 2,
              boxShadow: 1,
              bgcolor: "#0B2D4D",
            }}
          >
            <BrandLogo
              compact
              iconClassName=""
              sx={{ "& > div": { bgcolor: "transparent", boxShadow: "none" } }}
            />
          </Box>

          {/* Notifications button */}
          <Box sx={{ position: "absolute", left: 0 }} ref={notificationsRef}>
            <IconButton
              aria-label={`Notifications (${unreadCount} unread)`}
              aria-haspopup="true"
              aria-expanded={notificationsOpen}
              aria-controls="notifications-panel"
              onClick={toggleNotifications}
              size="small"
              sx={{
                border: "1px solid rgba(0,0,0,0.12)",
                bgcolor: "transparent",
                color: "text.secondary",
              }}
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
                  position: "absolute",
                  left: 0,
                  top: "calc(100% + 8px)",
                  width: { xs: "calc(100vw - 1.5rem)", sm: 320 },
                  maxWidth: 352,
                  borderRadius: "16px",
                  zIndex: 50,
                  animation: "fadeIn 180ms ease-out",
                  overflow: "hidden",
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
                    <Button size="small" onClick={markAllNotificationsRead} sx={{ textTransform: "none", color: "text.secondary", minWidth: "auto" }}>
                      Mark all read
                    </Button>
                    <Button size="small" onClick={() => setNotificationsOpen(false)} sx={{ textTransform: "none", minWidth: "auto" }}>
                      Close
                    </Button>
                  </Box>
                </Box>
                <List dense sx={{ maxHeight: 256, overflowY: "auto", p: 1 }} className="thin-scroll">
                  {notifications.length === 0 && (
                    <ListItem>
                      <Typography variant="body2" color="text.secondary">No notifications</Typography>
                    </ListItem>
                  )}
                  {notifications.map((n) => (
                    <ListItem
                      key={n.id}
                      sx={{
                        gap: 1,
                        borderRadius: "12px",
                        bgcolor: n.unread ? "#FAFCFE" : "transparent",
                        transition: "all 0.2s",
                        "&:hover": { bgcolor: "#F1F5F9", transform: "translateY(-1px)" },
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{n.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{n.createdAt}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>{n.detail}</Typography>
                      </Box>
                      {n.unread && (
                        <Button size="small" onClick={() => markNotificationRead(n.id)} sx={{ textTransform: "none", minWidth: "auto", fontSize: "0.7rem" }}>
                          Mark
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to access the publications dashboard
        </Typography>

        {/* Google Sign In */}
        <Button
          fullWidth
          variant="contained"
          onClick={onGoogleClick}
          disabled={isRedirecting}
          startIcon={isRedirecting ? <LoadingSpinner size={16} color="inherit" /> : <GoogleIcon sx={{ fontSize: "1rem !important", filter: "brightness(0) invert(1)" }} />}
          sx={{
            bgcolor: "#005B96",
            "&:hover": { bgcolor: "#0077B6" },
            py: 1.5,
            borderRadius: "16px",
            fontSize: "0.875rem",
            boxShadow: 2,
          }}
        >
          {isRedirecting ? "Connecting to Google..." : "Sign in with Google"}
        </Button>

        {/* Divider */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 3 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "text.secondary" }}>
            or
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        {/* Mock Sign In buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "text.secondary", display: "block", mb: 0.5 }}>
            Development Mock Sign In
          </Typography>
          {[
            { label: "🔑 Sign in as Dr. Meera Iyer (Faculty)", email: "faculty1@vnrvjiet.in", role: "faculty", name: "Dr. Meera Iyer" },
            { label: "🔑 Sign in as Prof. Ananya Rao (Faculty)", email: "faculty2@vnrvjiet.in", role: "faculty", name: "Prof. Ananya Rao" },
            { label: "🔑 Sign in as Admin User (Admin)", email: "admin1@vnrvjiet.in", role: "admin", name: "Admin User" },
          ].map((user) => (
            <Button
              key={user.email}
              fullWidth
              variant="outlined"
              disabled={isRedirecting}
              onClick={() => handleMockSignIn(user.email, user.role, user.name)}
              sx={{
                borderRadius: "16px",
                borderColor: "#D9E2EC",
                bgcolor: "#FAFCFE",
                color: "#0B2D4D",
                fontWeight: 600,
                fontSize: "0.875rem",
                py: 1.5,
                "&:hover": { bgcolor: "#F1F5F9", borderColor: "#0077B6" },
              }}
            >
              {user.label}
            </Button>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
