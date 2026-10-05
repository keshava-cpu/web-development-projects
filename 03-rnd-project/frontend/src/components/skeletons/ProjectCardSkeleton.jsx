import Grid from '@mui/material/Grid';
import { Box, Paper, Skeleton, Stack } from '@mui/material';

/**
 * Mirrors the project card grid layout of ProjectsDashboardPage.
 * Shows two sections (Active + Pending) each with 3 card skeletons.
 */
const SectionSkeleton = ({ count = 3 }) => (
  <Box sx={{ mb: 4 }}>
    {/* Section heading */}
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Skeleton variant="text" width={160} height={28} />
      <Skeleton variant="text" width={80} height={20} />
    </Stack>
    <Grid container spacing={2.5}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: 2, height: '100%' }}>
            <Stack spacing={2}>
              {/* Header: title + status badge */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                <Stack spacing={0.5} sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" height={24} />
                  <Skeleton variant="text" width="55%" height={18} />
                </Stack>
                <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 99 }} />
              </Stack>
              {/* Amount */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={100} height={22} />
              </Stack>
              {/* PI / Co-PI */}
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Skeleton variant="circular" width={18} height={18} />
                  <Skeleton variant="text" width="60%" height={18} />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Skeleton variant="circular" width={18} height={18} />
                  <Skeleton variant="text" width="50%" height={18} />
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const ProjectCardSkeleton = () => (
  <Box>
    <SectionSkeleton count={3} />
    <SectionSkeleton count={3} />
  </Box>
);

export default ProjectCardSkeleton;
