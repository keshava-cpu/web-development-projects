import Grid from "@mui/material/Grid";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import { useNavigate } from "react-router-dom";
import { colors } from "../theme/colors";

const moduleCards = [
  {
    title: "Funded Projects",
    description:
      "Monitor agency grants, utilization reports, and investigator assignments.",
    icon: AssignmentOutlinedIcon,
    path: "/projects",
    btnLabel: "Open Projects",
    btnId: "dashboard-projects-btn",
  },
  {
    title: "Publications Tracker",
    description:
      "Submit, review, and track academic publications through the full editorial workflow.",
    icon: ScienceOutlinedIcon,
    path: "/publications-tracker/dashboard",
    btnLabel: "Open Publications",
    btnId: "dashboard-publications-btn",
  },
  {
    title: "Patents",
    description:
      "Record and manage Filed, Published, and Granted patents with full RBAC control.",
    icon: BalanceOutlinedIcon,
    path: "/patents",
    btnLabel: "Open Patents",
    btnId: "dashboard-patents-btn",
    highlight: true,
  },
  {
    title: "Analytics & Reports",
    description:
      "Review aggregate metrics across the R&D management ecosystem.",
    icon: TrendingUpOutlinedIcon,
    path: "/reports",
    btnLabel: "View Reports",
    btnId: "dashboard-reports-btn",
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: 3,
          bgcolor: colors.white,
          border: `1px solid ${colors.lightSteel}`,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Research Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to the R&D Management workspace. Use the navigation bar or the
          shortcuts below to access funded projects, publications, patents, and
          institutional reports.
        </Typography>
      </Paper>

      <Grid container spacing={2.5}>
        {moduleCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid key={card.title} size={{ xs: 12, md: 6, lg: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: colors.white,
                  border: card.highlight
                    ? `1.5px solid ${colors.innovationCyan}`
                    : `1px solid ${colors.lightSteel}`,
                  transition: "box-shadow 0.18s ease, transform 0.18s ease",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Stack spacing={1.5} flex={1}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: card.highlight
                        ? "rgba(0,188,212,0.12)"
                        : "rgba(0, 150, 136, 0.12)",
                    }}
                  >
                    <Icon
                      sx={{
                        color: card.highlight
                          ? colors.innovationCyan
                          : colors.scientificTeal,
                      }}
                    />
                  </Box>
                  <Typography variant="h6">{card.title}</Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {card.description}
                  </Typography>
                </Stack>

                <Box mt={2}>
                  <Button
                    id={card.btnId}
                    variant={card.highlight ? "contained" : "outlined"}
                    size="small"
                    fullWidth
                    onClick={() => navigate(card.path)}
                    sx={
                      card.highlight
                        ? {
                            bgcolor: colors.innovationCyan,
                            color: colors.midnightBlue,
                            fontWeight: 700,
                            "&:hover": { bgcolor: "#33c9da" },
                          }
                        : {}
                    }
                  >
                    {card.btnLabel}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
};

export default DashboardPage;
