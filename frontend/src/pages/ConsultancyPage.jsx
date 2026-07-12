import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import {
  createConsultancy,
  deleteConsultancy,
  fetchConsultancy,
  updateConsultancy,
} from '../api/consultancy';
import { colors } from '../theme/colors';
import ConsultancyTableSkeleton from '../components/skeletons/ConsultancyTableSkeleton';

const emptyForm = { industry: '', amount: '', duration: '' };

const ConsultancyPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);

  // ── Data Loading ────────────────────────────────────────────────────────────
  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchConsultancy();
      setRecords(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load consultancy records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // ── Dialog helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (record) => {
    setEditTarget(record);
    setForm({
      industry: record.industry || '',
      amount: record.amount != null ? String(record.amount) : '',
      duration: record.duration || '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFormError(null);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.industry.trim()) {
      setFormError('Industry is required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        industry: form.industry.trim(),
        amount: form.amount ? Number(form.amount) : 0,
        duration: form.duration.trim() || null,
      };
      if (editTarget) {
        await updateConsultancy(editTarget.consultancy_id, payload);
      } else {
        await createConsultancy(payload);
      }
      await loadRecords();
      closeDialog();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save record.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await deleteConsultancy(deleteId);
      await loadRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setSubmitting(false);
      setDeleteId(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
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
          spacing={2}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <BusinessCenterOutlinedIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ color: colors.white, mb: 0.5 }}>
                Consultancy Records
              </Typography>
              <Typography variant="body1" sx={{ color: colors.lightSteel }}>
                Track industry partnerships, funding amounts, and project durations.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshOutlinedIcon />}
              onClick={loadRecords}
              sx={{
                color: colors.white,
                borderColor: colors.lightSteel,
                '&:hover': { borderColor: colors.white, bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              sx={{
                bgcolor: colors.innovationCyan,
                color: colors.midnightBlue,
                fontWeight: 700,
                '&:hover': { bgcolor: '#33b8d4' },
              }}
            >
              Add Record
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Error banner */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      {loading ? (
        <ConsultancyTableSkeleton />
      ) : records.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            border: `1px dashed ${colors.lightSteel}`,
            bgcolor: colors.white,
          }}
        >
          <BusinessCenterOutlinedIcon
            sx={{ fontSize: 56, color: colors.lightSteel, mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            No consultancy records yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by adding your first industry consultancy record.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add First Record
          </Button>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: `1px solid ${colors.lightSteel}` }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.researchGray }}>
                <TableCell sx={{ fontWeight: 700 }}>Industry</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((row) => (
                <TableRow
                  key={row.consultancy_id}
                  hover
                  sx={{ '&:last-child td': { border: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.industry}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.amount != null
                      ? `₹${Number(row.amount).toLocaleString('en-IN')}`
                      : '—'}
                  </TableCell>
                  <TableCell>{row.duration || '—'}</TableCell>
                  <TableCell>
                    {row.created_at
                      ? new Date(row.created_at).toLocaleDateString('en-IN')
                      : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(row)}
                        sx={{ color: colors.academicBlue }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteId(row.consultancy_id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editTarget ? 'Edit Consultancy Record' : 'Add Consultancy Record'}
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Industry / Partner *"
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
            <TextField
              label="Duration"
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              fullWidth
              placeholder="e.g. 6 months"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving…' : editTarget ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Record?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This action cannot be undone. The consultancy record will be permanently
            removed from Supabase.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ConsultancyPage;
