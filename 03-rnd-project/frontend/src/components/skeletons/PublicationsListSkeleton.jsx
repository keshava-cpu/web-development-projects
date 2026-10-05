import { Box, Skeleton, Stack } from '@mui/material';

/**
 * Mirrors a publications list entry row:
 * - Title bar
 * - Two meta lines (department / status)
 * - Thin separator
 */
const PublicationItemSkeleton = () => (
  <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E2EBF0' }}>
    <Stack spacing={0.75}>
      <Skeleton variant="text" width="75%" height={20} />
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rounded" width={64} height={18} sx={{ borderRadius: 99 }} />
        <Skeleton variant="text" width={90} height={18} />
      </Stack>
      <Skeleton variant="text" width="50%" height={16} />
    </Stack>
  </Box>
);

/**
 * 8 stacked publication list-item skeletons inside a card, with a search-bar
 * skeleton at the top to mirror the real DashboardListView layout.
 */
const PublicationsListSkeleton = () => (
  <Box
    sx={{
      bgcolor: 'rgba(255,255,255,0.97)',
      borderRadius: '28px',
      boxShadow: '0 10px 30px rgba(11,45,77,0.08)',
      overflow: 'hidden',
      p: { xs: 2, sm: 3 },
    }}
  >
    {/* Header row */}
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Stack spacing={0.5}>
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="text" width={120} height={18} />
      </Stack>
      <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: 2 }} />
    </Stack>

    {/* Search bar */}
    <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2, mb: 2 }} />

    {/* Filter chips */}
    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
      {[80, 60, 100, 80, 70, 60].map((w, i) => (
        <Skeleton key={i} variant="rounded" width={w} height={28} sx={{ borderRadius: 99 }} />
      ))}
    </Stack>

    {/* Entry rows */}
    {Array.from({ length: 8 }).map((_, i) => (
      <PublicationItemSkeleton key={i} />
    ))}
  </Box>
);

export default PublicationsListSkeleton;
