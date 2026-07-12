import { Box, Paper, Skeleton, Stack, Divider } from '@mui/material';

/**
 * Skeleton for the Publications Detail View layout.
 * Mirrors the dual-pane layout containing the sidebar filter/search list
 * on the left and the detailed entry view with the timeline on the right.
 */
const PublicationsDetailSkeleton = () => (
  <Box sx={{ width: "100%", flex: 1, display: "flex", overflow: "hidden", bgcolor: "#FAFCFE" }}>
    <Box
      component="section"
      sx={{
        mx: "auto",
        width: "100%",
        maxWidth: 1600,
        flex: 1,
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        display: "flex",
        gap: 3,
        height: "calc(100vh - 64px)",
      }}
    >
      {/* Left Sidebar Skeleton (visible on md/lg viewports) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: 320,
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid #E2EBF0",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flex: 1,
            overflow: "hidden",
          }}
        >
          <Skeleton variant="rounded" height={40} />
          <Divider />
          <Stack spacing={2} sx={{ flex: 1, overflow: "hidden" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Box key={i} sx={{ borderBottom: "1px solid #E2EBF0", pb: 1.5 }}>
                <Skeleton variant="text" width="90%" height={20} />
                <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* Right Main Detail Area Skeleton */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid #E2EBF0",
            borderRadius: "16px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            overflow: "auto",
          }}
        >
          {/* Header section: status, title, owner */}
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 99 }} />
              <Skeleton variant="text" width={100} height={18} />
            </Stack>
            <Skeleton variant="text" width="85%" height={36} />
            <Stack direction="row" spacing={1} alignItems="center">
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width={180} height={20} />
            </Stack>
          </Stack>

          <Divider />

          {/* Description & metadata summary grid */}
          <Stack spacing={2}>
            <Skeleton variant="text" width={110} height={20} />
            <Skeleton variant="text" width="95%" height={16} />
            <Skeleton variant="text" width="90%" height={16} />
            <Skeleton variant="text" width="40%" height={16} />
          </Stack>

          <Divider />

          {/* Timeline and other actions */}
          <Stack spacing={2}>
            <Skeleton variant="text" width={140} height={22} />
            <Stack spacing={3} sx={{ pl: 2 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Stack key={i} direction="row" spacing={2} alignItems="center">
                  <Skeleton variant="circular" width={12} height={12} />
                  <Stack spacing={0.5} sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="50%" height={18} />
                    <Skeleton variant="text" width="30%" height={14} />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  </Box>
);

export default PublicationsDetailSkeleton;
