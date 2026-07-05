import { useState } from 'react';
import Grid from '@mui/material/Grid2';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PdfUploadField from './PdfUploadField';
import { colors } from '../../theme/colors';

const initialForm = {
  title: '',
  agency: '',
  amount: '',
  pi: '',
  copi: '',
  status: 'Pending',
};

const AddProjectDialog = ({ open, onClose, onSubmit, submitting, error }) => {
  const [form, setForm] = useState(initialForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleClose = () => {
    setForm(initialForm);
    setPdfFile(null);
    setPdfError(null);
    setValidationError(null);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError(null);

    if (!form.title.trim() || !form.agency.trim() || !form.pi.trim()) {
      setValidationError('Project Title, Funding Agency, and PI are required.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount) || 0,
        utilizationReport: pdfFile,
      });
      handleClose();
    } catch {
      // Parent hook surfaces API errors.
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="md"
      // Form context now securely encapsulates the entire content/action ecosystem
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle sx={{ color: colors.midnightBlue, fontWeight: 700 }}>
        Add New Funded Project
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: colors.softWhite }}>
        <Stack spacing={3}>
          {(validationError || error) && (
            <Alert severity="error">{validationError || error}</Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
                <TextField
                  label="Project Title"
                  value={form.title}
                  onChange={handleChange('title')}
                  fullWidth
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Funding Agency"
                  value={form.agency}
                  onChange={handleChange('agency')}
                  fullWidth
                  required
                />
              </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Project Amount (INR)"
                type="number"
                value={form.amount}
                onChange={handleChange('amount')}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Principal Investigator (PI)"
                value={form.pi}
                onChange={handleChange('pi')}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Co-Principal Investigator (CoPI)"
                value={form.copi}
                onChange={handleChange('copi')}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Project Status"
                value={form.status}
                onChange={handleChange('status')}
                fullWidth
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <PdfUploadField
            value={pdfFile}
            onChange={(file, message) => {
              setPdfFile(file);
              setPdfError(message);
            }}
            error={pdfError}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          type="submit" // Fires directly up into PaperProps form root natively
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          disabled={submitting}
        >
          {submitting ? 'Saving Project...' : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProjectDialog;