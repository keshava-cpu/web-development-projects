import Grid from '@mui/material/Grid';
import { Box, Divider, Paper, Skeleton, Stack } from '@mui/material';

/**
 * A single stat-card skeleton — matches StatCard in ReportsPage.
 */
const StatCardSkeleton = () => (
  <Paper elevation={0} sx={{ p: 3, border: '1px solid #E5E7EB', height: '100%', borderRadius: 2 }}>
    <Stack spacing={1.5}>
      <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 2 }} />
      <Box>
        <Skeleton variant="text" width={60} height={48} />
        <Skeleton variant="text" width={140} height={16} />
      </Box>
      <Skeleton variant="text" width={120} height={16} />
    </Stack>
  </Paper>
);

/**
 * Mirrors the Reports page: section header + 4 stat cards + 2 financial cards.
 */
const ReportsStatSkeleton = () => (
  <Stack spacing={3}>
    {/* Record Counts section */}
    <Box>
      <Skeleton variant="text" width={140} height={20} sx={{ mb: 0.5 }} />
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2.5}>
        {[0, 1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </Box>

    {/* Financial Summary section */}
    <Box>
      <Skeleton variant="text" width={160} height={20} sx={{ mb: 0.5 }} />
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2.5}>
        {[0, 1].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6 }}>
            <StatCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </Box>
  </Stack>
);

export default ReportsStatSkeleton;
