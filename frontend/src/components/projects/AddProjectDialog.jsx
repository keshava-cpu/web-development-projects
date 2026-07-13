import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
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
} from "@mui/material";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PdfUploadField from "./PdfUploadField";
import { colors } from "../../theme/colors";

const initialForm = {
  title: "",
  agency: "",
  amount: "",
  pi: "",
  copi: "",
  status: "Pending",
};

const AddProjectDialog = ({
  open,
  onClose,
  onSubmit,
  submitting,
  error,
  project = null,
}) => {
  const [form, setForm] = useState(initialForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const isEditMode = !!project;

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

  useEffect(() => {
    if (open) {
      if (project) {
        setForm({
          title: project.title || "",
          agency: project.agency || "",
          amount: project.amount || "",
          pi: project.pi || "",
          copi: project.co_pi || project.copi || "", // handles both naming variations safely
          status: project.status || "Pending",
        });
      } else {
        setForm(initialForm);
      }
      setPdfFile(null);
      setPdfError(null);
      setValidationError(null);
    }
  }, [open, project]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError(null);

    if (!form.title.trim() || !form.agency.trim() || !form.pi.trim()) {
      setValidationError("Project Title, Funding Agency, and PI are required.");
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
      slotProps={{
        paper: {
          component: "form",
          onSubmit: handleSubmit,
        },
      }}
    >
      <DialogTitle sx={{ color: colors.midnightBlue, fontWeight: 700 }}>
        {isEditMode ? "Edit Funded Project" : "Add New Funded Project"}
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: colors.softWhite }}>
        <Stack spacing={3}>
          {(validationError || error) && (
            <Alert severity="error">{validationError || error}</Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Project Title"
                value={form.title} // Fixed bug here: pointed to agency originally
                onChange={handleChange("title")}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Funding Agency"
                value={form.agency}
                onChange={handleChange("agency")}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Project Amount (INR)"
                type="number"
                value={form.amount}
                onChange={handleChange("amount")}
                fullWidth
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Principal Investigator (PI)"
                value={form.pi}
                onChange={handleChange("pi")}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Co-Principal Investigator (CoPI)"
                value={form.copi}
                onChange={handleChange("copi")}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Project Status"
                value={form.status}
                onChange={handleChange("status")}
                fullWidth
              >
                <MenuItem value="Ongoing">Ongoing</MenuItem>
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
          type="submit"
          variant="contained"
          startIcon={
            isEditMode ? <SaveOutlinedIcon /> : <AddCircleOutlinedIcon />
          }
          disabled={submitting}
        >
          {submitting
            ? "Saving Project..."
            : isEditMode
              ? "Save Changes"
              : "Create Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProjectDialog;
