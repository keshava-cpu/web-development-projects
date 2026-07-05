import Grid from '@mui/material/Grid2';
import { Paper, Stack, Typography, Box } from '@mui/material';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { colors } from '../theme/colors';

const summaryCards = [
  {
    title: 'Research Portfolio',
    description: 'Central hub for publications, patents, and consultancy records.',
    icon: ScienceOutlinedIcon,
  },
  {
    title: 'Funded Projects',
    description: 'Monitor agency grants, utilization reports, and investigator assignments.',
    icon: AssignmentOutlinedIcon,
  },
  {
    title: 'Analytics & Reports',
    description: 'Review aggregate metrics across the R&D management ecosystem.',
    icon: TrendingUpOutlinedIcon,
  },
];

const DashboardPage = () => (
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
        Welcome to the R&D Management workspace. Use the navigation bar to access funded
        projects, publications, and institutional reports.
      </Typography>
    </Paper>

    <Grid container spacing={2.5}>
      {summaryCards.map((card) => {
        const Icon = card.icon;
        return (
          <Grid key={card.title} size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                bgcolor: colors.white,
                border: `1px solid ${colors.lightSteel}`,
              }}
            >
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(0, 150, 136, 0.12)',
                  }}
                >
                  <Icon sx={{ color: colors.scientificTeal }} />
                </Box>
                <Typography variant="h6">{card.title}</Typography>
                <Typography variant="body2">{card.description}</Typography>
              </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  </Stack>
);

export default DashboardPage;
