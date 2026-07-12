import { Box, Paper, Skeleton, Stack } from '@mui/material';

/**
 * Mirrors the three-column kanban layout of PatentsPage.
 * Shows 3 columns × 3 skeleton cards each.
 */
const PatentCardSkeleton = () => (
  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ width: '100%' }}>
    {[0, 1, 2].map((col) => (
      <Box key={col} sx={{ flex: 1 }}>
        {/* Column header chip */}
        <Box
          sx={{
            px: 1.5, py: 0.75, borderRadius: 1.5,
            bgcolor: '#F3F4F6', border: '1px solid #E5E7EB',
            mb: 1.5, display: 'flex', alignItems: 'center', gap: 1,
          }}
        >
          <Skeleton variant="text" width={80} height={22} />
          <Skeleton variant="circular" width={20} height={20} />
        </Box>

        {/* 3 card skeletons per column */}
        <Stack spacing={1.5}>
          {[0, 1, 2].map((card) => (
            <Paper key={card} elevation={0} sx={{ p: 2.5, border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <Stack spacing={1}>
                {/* Title + badge */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Skeleton variant="text" width="70%" height={22} />
                  <Skeleton variant="rounded" width={56} height={22} sx={{ borderRadius: 99 }} />
                </Stack>
                <Skeleton variant="text" width="55%" height={18} />
                <Skeleton variant="text" width="40%" height={18} />
                {/* Action row */}
                <Stack direction="row" justifyContent="flex-end" spacing={0.5} pt={0.5}>
                  <Skeleton variant="circular" width={28} height={28} />
                  <Skeleton variant="circular" width={28} height={28} />
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>
    ))}
  </Stack>
);

export default PatentCardSkeleton;
