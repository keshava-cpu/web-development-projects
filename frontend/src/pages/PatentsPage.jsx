import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { usePatents } from '../hooks/usePatents';
import { colors } from '../theme/colors';
import PatentCardSkeleton from '../components/skeletons/PatentCardSkeleton';

// ─── Status badge colours (spec-defined) ────────────────────────────────────
const STATUS_COLORS = {
  Filed:     { bg: '#FEF3C7', text: '#D97706', border: '#D97706' },
  Published: { bg: '#E0F7FA', text: '#00A6C8', border: '#00A6C8' },
  Granted:   { bg: '#D1FAE5', text: '#16803C', border: '#16803C' },
};

const STATUSES = ['Filed', 'Published', 'Granted'];

const PATENT_OFFICES = ['IPO', 'USPTO', 'EPO', 'WIPO', 'Other'];

const emptyForm = {
  title: '',
  status: 'Filed',
  number: '',
  inventors: '',
  filing_date: '',
  publication_date: '',
  grant_date: '',
  patent_office: '',
  category: '',
  description: '',
  department: '',
  document_path: '',
};

// ─── PatentStatusBadge ────────────────────────────────────────────────────────
function PatentStatusBadge({ status }) {
  const palette = STATUS_COLORS[status] ?? { bg: '#F3F4F6', text: '#6B7280', border: '#6B7280' };
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: palette.bg,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        fontWeight: 600,
        fontSize: '0.72rem',
        height: 24,
      }}
    />
  );
}

// ─── PatentCard ────────────────────────────────────────────────────────────────
function PatentCard({ patent, onEdit, onDelete }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: `1px solid ${colors.lightSteel}`,
        bgcolor: colors.white,
        borderRadius: 2,
        transition: 'box-shadow 0.18s ease, transform 0.18s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack spacing={1.5}>
        {/* Title + badge row */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ color: colors.midnightBlue, flex: 1, lineHeight: 1.35 }}
          >
            {patent.title}
          </Typography>
          <PatentStatusBadge status={patent.status} />
        </Stack>

        {/* Meta fields */}
        <Stack spacing={0.5}>
          {patent.number && (
            <Typography variant="body2" sx={{ color: colors.graphite }}>
              <strong>Patent No.:</strong> {patent.number}
            </Typography>
          )}
          {patent.inventors && (
            <Typography variant="body2" sx={{ color: colors.graphite }}>
              <strong>Inventors:</strong> {patent.inventors}
            </Typography>
          )}
          {patent.department && (
            <Typography variant="body2" sx={{ color: colors.graphite }}>
              <strong>Dept.:</strong> {patent.department}
            </Typography>
          )}
          {patent.patent_office && (
            <Typography variant="body2" sx={{ color: colors.graphite }}>
              <strong>Office:</strong> {patent.patent_office}
            </Typography>
          )}
          {patent.filing_date && (
            <Typography variant="body2" sx={{ color: colors.coolGray }}>
              Filed: {new Date(patent.filing_date).toLocaleDateString()}
            </Typography>
          )}
        </Stack>

        {/* Description excerpt */}
        {patent.description && (
          <Typography
            variant="body2"
            sx={{
              color: colors.coolGray,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {patent.description}
          </Typography>
        )}

        {/* Actions */}
        <Stack direction="row" justifyContent="flex-end" spacing={0.5} pt={0.5}>
          <Tooltip title="Edit patent">
            <IconButton
              size="small"
              onClick={() => onEdit(patent)}
              sx={{ color: colors.academicBlue }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete patent">
            <IconButton
              size="small"
              onClick={() => onDelete(patent)}
              sx={{ color: '#EF4444' }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}

// ─── PatentFormDialog ─────────────────────────────────────────────────────────
function PatentFormDialog({ open, onClose, onSubmit, initialValues, submitting, error }) {
  const isEdit = Boolean(initialValues?.patent_id);
  const [form, setForm] = useState(initialValues ?? emptyForm);
  const [validationError, setValidationError] = useState(null);

  // Sync when initialValues changes (edit → different patent)
  const handleOpen = () => {
    setForm(initialValues ?? emptyForm);
    setValidationError(null);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleClose = () => {
    setForm(emptyForm);
    setValidationError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!form.title.trim() || !form.status) {
      setValidationError('Title and Status are required.');
      return;
    }

    try {
      await onSubmit(form);
      handleClose();
    } catch {
      // errors surfaced by parent hook
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        transition: { onEnter: handleOpen },
        paper: { component: 'form', onSubmit: handleSubmit },
      }}
    >
      <DialogTitle sx={{ color: colors.midnightBlue, fontWeight: 700 }}>
        {isEdit ? 'Edit Patent' : 'Add New Patent'}
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: colors.softWhite ?? '#F8FAFC' }}>
        <Stack spacing={3} pt={1}>
          {(validationError || error) && (
            <Alert severity="error">{validationError || error}</Alert>
          )}

          <Grid container spacing={2}>
            {/* Title — full width */}
            <Grid size={{ xs: 12 }} >
              <TextField
                label="Patent Title"
                value={form.title}
                onChange={handleChange('title')}
                fullWidth
                required
              />
            </Grid>

            {/* Status + Patent Office */}
            <Grid size={{ xs: 12, md: 6 }}  >
              <TextField
                select
                label="Status"
                value={form.status}
                onChange={handleChange('status')}
                fullWidth
                required
              >
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}  >
              <TextField
                select
                label="Patent Office"
                value={form.patent_office}
                onChange={handleChange('patent_office')}
                fullWidth
              >
                <MenuItem value="">— None —</MenuItem>
                {PATENT_OFFICES.map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Patent number + category */}
            <Grid size={{ xs: 12, md: 6 }}  >
              <TextField
                label="Patent Number"
                value={form.number}
                onChange={handleChange('number')}
                fullWidth
                placeholder="e.g. IN202041012345"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}  >
              <TextField
                label="Category"
                value={form.category}
                onChange={handleChange('category')}
                fullWidth
                placeholder="e.g. Utility, Design, Plant"
              />
            </Grid>

            {/* Inventors + Department */}
            <Grid size={{ xs: 12, md: 8 }}  >
              <TextField
                label="Inventors"
                value={form.inventors}
                onChange={handleChange('inventors')}
                fullWidth
                placeholder="Comma-separated names"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}  >
              <TextField
                label="Department"
                value={form.department}
                onChange={handleChange('department')}
                fullWidth
                placeholder="e.g. CSE"
              />
            </Grid>

            {/* Dates */}
            <Grid size={{ xs: 12, md: 4 }}  >
              <TextField
                label="Filing Date"
                type="date"
                value={form.filing_date}
                onChange={handleChange('filing_date')}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}  >
              <TextField
                label="Publication Date"
                type="date"
                value={form.publication_date}
                onChange={handleChange('publication_date')}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}  >
              <TextField
                label="Grant Date"
                type="date"
                value={form.grant_date}
                onChange={handleChange('grant_date')}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            {/* Document path */}
            <Grid size={{ xs: 12 }} >
              <TextField
                label="Document Path / URL"
                value={form.document_path}
                onChange={handleChange('document_path')}
                fullWidth
                placeholder="Relative path or cloud URL to the patent PDF"
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }} >
              <TextField
                label="Description"
                value={form.description}
                onChange={handleChange('description')}
                fullWidth
                multiline
                rows={3}
                placeholder="Brief abstract or description of the patent"
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          disabled={submitting}
          sx={{
            bgcolor: colors.innovationCyan ?? '#00BCD4',
            color: colors.midnightBlue,
            '&:hover': { bgcolor: '#33c9da' },
          }}
        >
          {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Patent'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────
function ConfirmDeleteDialog({ open, patent, onConfirm, onCancel, submitting }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ color: '#B91C1C', fontWeight: 700 }}>
        Delete Patent?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Are you sure you want to delete{' '}
          <strong>&ldquo;{patent?.title}&rdquo;</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={submitting}
          sx={{ bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}
        >
          {submitting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── PatentsPage ──────────────────────────────────────────────────────────────
const PatentsPage = () => {
  const { patents, loading, submitting, error, loadPatents, addPatent, editPatent, removePatent } =
    usePatents();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);   // patent object being edited
  const [deleteTarget, setDeleteTarget] = useState(null); // patent object pending delete
  const [successMessage, setSuccessMessage] = useState(null);

  const handleCreate = async (formValues) => {
    await addPatent(formValues);
    setSuccessMessage('Patent added successfully.');
  };

  const handleEdit = async (formValues) => {
    await editPatent(editTarget.patent_id, formValues);
    setSuccessMessage('Patent updated successfully.');
  };

  const handleDeleteConfirm = async () => {
    await removePatent(deleteTarget.patent_id);
    setDeleteTarget(null);
    setSuccessMessage('Patent deleted successfully.');
  };

  // Group patents by status for organised display
  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = patents.filter((p) => p.status === s);
    return acc;
  }, {});

  const totalCount = patents.length;

  return (
    <Stack spacing={3}>
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${colors.lightSteel}`,
          background: `linear-gradient(135deg, ${colors.midnightBlue} 0%, #1a3a5c 100%)`,
          color: colors.white,
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(0,188,212,0.18)',
              }}
            >
              <BalanceOutlinedIcon sx={{ color: colors.innovationCyan ?? '#00BCD4', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ color: colors.white, mb: 0.25 }}>
                Patents
              </Typography>
              <Typography variant="body2" sx={{ color: colors.lightSteel }}>
                {totalCount} patent{totalCount !== 1 ? 's' : ''} on record
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshOutlinedIcon />}
              onClick={loadPatents}
              sx={{
                color: colors.white,
                borderColor: colors.lightSteel,
                '&:hover': { borderColor: colors.white, bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Refresh
            </Button>
            <Button
              id="add-patent-btn"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddOpen(true)}
              sx={{
                bgcolor: colors.innovationCyan ?? '#00BCD4',
                color: colors.midnightBlue,
                '&:hover': { bgcolor: '#33c9da' },
                fontWeight: 700,
              }}
            >
              Add Patent
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ── Alerts ────────────────────────────────────────────────────────── */}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      {error && !addOpen && !editTarget && (
        <Alert severity="error">{error}</Alert>
      )}

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading ? (
        <PatentCardSkeleton />
      ) : patents.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            border: `1px dashed ${colors.lightSteel}`,
            borderRadius: 2,
          }}
        >
          <BalanceOutlinedIcon sx={{ fontSize: 48, color: colors.lightSteel, mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No patents on record yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Click &ldquo;Add Patent&rdquo; to record your first patent.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{ bgcolor: colors.innovationCyan ?? '#00BCD4', color: colors.midnightBlue }}
          >
            Add Patent
          </Button>
        </Paper>
      ) : (
        /* ── Grouped columns ─────────────────────────────────────────────── */
        <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
          {STATUSES.map((status) => {
            const palette = STATUS_COLORS[status];
            const group = grouped[status];
            return (
              <Grid size={{ xs: 12, md: 4 }}   key={status}>
                {/* Column header */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  mb={1.5}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1.5,
                    bgcolor: palette.bg,
                    border: `1px solid ${palette.border}22`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ color: palette.text, flex: 1 }}
                  >
                    {status}
                  </Typography>
                  <Chip
                    label={group.length}
                    size="small"
                    sx={{
                      bgcolor: palette.border,
                      color: '#fff',
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  />
                </Stack>

                {/* Cards */}
                <Stack spacing={1.5}>
                  {group.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ px: 1.5, py: 2, textAlign: 'center' }}
                    >
                      No {status.toLowerCase()} patents
                    </Typography>
                  ) : (
                    group.map((patent) => (
                      <PatentCard
                        key={patent.patent_id}
                        patent={patent}
                        onEdit={(p) => setEditTarget(p)}
                        onDelete={(p) => setDeleteTarget(p)}
                      />
                    ))
                  )}
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ── Add Dialog ────────────────────────────────────────────────────── */}
      <PatentFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
        initialValues={emptyForm}
        submitting={submitting}
        error={addOpen ? error : null}
      />

      {/* ── Edit Dialog ───────────────────────────────────────────────────── */}
      <PatentFormDialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        initialValues={editTarget}
        submitting={submitting}
        error={editTarget ? error : null}
      />

      {/* ── Delete Dialog ─────────────────────────────────────────────────── */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        patent={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        submitting={submitting}
      />
    </Stack>
  );
};

export default PatentsPage;
