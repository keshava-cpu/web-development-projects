import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

export default function AdminDashboard({ entries, users }) {
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const facultyCount = totalUsers - adminCount;
  const totalPublications = entries.length;
  const reviewCount = entries.filter((e) => e.status === "in_review").length;
  const approvedCount = entries.filter((e) => e.status === "approved_for_publication").length;
  const publishedCount = entries.filter((e) => e.status === "published").length;

  const quickLinks = [
    {
      to: "review",
      label: "Review queue",
      stat: `${reviewCount} pending items`,
      desc: "Approve, request edits, or publish pending workflows.",
    },
    {
      to: "publications",
      label: "Publications",
      stat: `${totalPublications} records`,
      desc: "Browse every submission and inspect status at a glance.",
    },
    {
      to: "users",
      label: "User directory",
      stat: `${facultyCount} faculty + ${adminCount} admins`,
      desc: "Verify accounts, roles, and profile details for active users.",
    },
  ];

  return (
    <Box component="section">
      <Grid container spacing={3}>
        {/* Left panel */}
        <Grid size={{ xs: 12, xl: 8 }}  >
          <Card sx={{ borderRadius: "32px", p: { xs: 3, sm: 5 }, boxShadow: "0 10px 30px rgba(11,45,77,0.08)" }}>
            <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "text.secondary" }}>
              Admin workspace
            </Typography>
            <Typography variant="h4" sx={{ mt: 2, fontWeight: 600, color: "#1F2933" }}>
              Admin dashboard
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, lineHeight: 1.7, color: "#4B5563" }}>
              Welcome to the admin console. Review submissions, approve publications, and audit users from one central place.
            </Typography>

            <Grid container spacing={2} sx={{ mt: 4 }}>
              {quickLinks.map((link) => (
                <Grid size={{ xs: 12, sm: 6 }}   key={link.to}>
                  <Card
                    component={Link}
                    to={link.to}
                    sx={{
                      display: "block",
                      textDecoration: "none",
                      borderRadius: "24px",
                      bgcolor: "#F1F5F9",
                      border: "1px solid #D9E2EC",
                      p: 3,
                      transition: "background 0.2s",
                      "&:hover": { bgcolor: "#E2EAF1" },
                    }}
                  >
                    <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "text.secondary" }}>
                      {link.label}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 600, color: "#1F2933" }}>
                      {link.stat}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#4B5563" }}>
                      {link.desc}
                    </Typography>
                  </Card>
                </Grid>
              ))}

              <Grid size={{ xs: 12, sm: 6 }}  >
                <Box sx={{ borderRadius: "24px", bgcolor: "#F1F5F9", border: "1px solid #D9E2EC", p: 3 }}>
                  <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "text.secondary" }}>
                    Admin actions
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 600, color: "#1F2933" }}>
                    Centralized oversight
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: "#4B5563" }}>
                    Admins can approve entries, request revisions, and publish work for everyone.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1.5, color: "#4B5563" }}>
                    Approved {approvedCount} entries · Published {publishedCount} entries.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right panel */}
        <Grid size={{ xs: 12, xl: 4 }}  >
          <Card
            sx={{
              borderRadius: "32px",
              p: { xs: 3, sm: 5 },
              bgcolor: "#0B2D4D",
              color: "white",
              boxShadow: "0 10px 30px rgba(11,45,77,0.08)",
              height: "100%",
            }}
          >
            <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
              Admin capabilities
            </Typography>
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
              What admins can do
            </Typography>
            <List dense sx={{ mt: 3, "& .MuiListItem-root": { px: 0, py: 0.5 } }}>
              {[
                "Review entries submitted for publication.",
                "Approve or request changes for pending submissions.",
                "Publish entries once they are approved.",
                "Audit faculty and admin user access.",
                "Monitor the queue and take action on high-priority items.",
              ].map((item) => (
                <ListItem key={item} sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", alignItems: "flex-start" }}>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>• {item}</Typography>
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 4, borderRadius: "24px", bgcolor: "rgba(255,255,255,0.1)", p: 3 }}>
              <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
                Quick reference
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                Admins are the only role with access to the full review workflow. The rest of the app is built around faculty submissions and review requests.
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
