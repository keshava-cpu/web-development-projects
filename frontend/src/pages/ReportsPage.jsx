import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import { fetchReports } from '../api/reports';
import { colors } from '../theme/colors';

// ── Stat card component ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, highlight, subtitle }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      border: highlight
        ? `1.5px solid ${colors.innovationCyan}`
        : `1px solid ${colors.lightSteel}`,
      bgcolor: colors.white,
      height: '100%',
      transition: 'box-shadow 0.18s ease, transform 0.18s ease',
      '&:hover': {
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transform: 'translateY(-2px)',
      },
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
          bgcolor: highlight ? 'rgba(0,188,212,0.12)' : 'rgba(0,150,136,0.10)',
        }}
      >
        <Icon
          sx={{
            color: highlight ? colors.innovationCyan : colors.scientificTeal,
          }}
        />
      </Box>
      <Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: highlight ? colors.innovationCyan : colors.midnightBlue,
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
    </Stack>
  </Paper>
);

// ── Main page ───────────────────────────────────────────────────────────────
const ReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchReports();
      setReports(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const fmt = (n) => (n != null ? Number(n).toLocaleString('en-IN') : '—');
  const fmtCurrency = (n) =>
    n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${colors.midnightBlue} 0%, ${colors.academicBlue} 100%)`,
          color: colors.white,
          border: `1px solid ${colors.lightSteel}`,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TrendingUpOutlinedIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ color: colors.white, mb: 0.5 }}>
                Analytics &amp; Reports
              </Typography>
              <Typography variant="body1" sx={{ color: colors.lightSteel }}>
                Live aggregate metrics across all R&amp;D modules from Supabase.
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlinedIcon />}
            onClick={loadReports}
            sx={{
              color: colors.white,
              borderColor: colors.lightSteel,
              '&:hover': { borderColor: colors.white, bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          action={
            <Button color="inherit" size="small" onClick={loadReports}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: colors.academicBlue }} />
        </Box>
      ) : reports ? (
        <Stack spacing={3}>
          {/* Section: Record Counts */}
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.5 }}
            >
              Record Counts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}   >
                <StatCard
                  icon={ScienceOutlinedIcon}
                  label="Publications"
                  value={fmt(reports.totals?.publications)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}   >
                <StatCard
                  icon={BalanceOutlinedIcon}
                  label="Patents"
                  value={fmt(reports.totals?.patents)}
                  highlight
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}   >
                <StatCard
                  icon={BusinessCenterOutlinedIcon}
                  label="Consultancy Records"
                  value={fmt(reports.totals?.consultancy)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}   >
                <StatCard
                  icon={AssignmentOutlinedIcon}
                  label="Funded Projects"
                  value={fmt(reports.totals?.projects)}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Section: Financials */}
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.5 }}
            >
              Financial Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}  >
                <StatCard
                  icon={AccountBalanceOutlinedIcon}
                  label="Total Consultancy Funding"
                  value={fmtCurrency(reports.financials?.consultancy_amount)}
                  subtitle="Aggregate across all consultancy records"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}  >
                <StatCard
                  icon={AccountBalanceOutlinedIcon}
                  label="Total Project Funding"
                  value={fmtCurrency(reports.financials?.project_amount)}
                  subtitle="Aggregate across all funded projects"
                  highlight
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default ReportsPage;
