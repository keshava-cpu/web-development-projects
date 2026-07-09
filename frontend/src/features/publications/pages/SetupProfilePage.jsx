import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import LoadingSpinner from "../components/LoadingSpinner";

const DEPARTMENTS = [
  "Computer Science",
  "Data Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Mathematics",
  "Physics",
  "Research Cell",
];

const TITLES = [
  "Assistant Professor",
  "Associate Professor",
  "Professor",
  "Research Scientist",
  "Lab Director",
  "Faculty",
];

export default function SetupProfilePage({
  initialName,
  initialEmail,
  initialRole,
  initialTitle = "Faculty",
  initialDepartment = "Research Cell",
  initialOffice = "",
  initialExpertise = "",
  initialBio = "",
  onSave,
  isEdit = false,
}) {
  const [fullName, setFullName] = useState(initialName);
  const [title, setTitle] = useState(initialTitle);
  const [department, setDepartment] = useState(initialDepartment);
  const [office, setOffice] = useState(initialOffice);
  const [expertise, setExpertise] = useState(initialExpertise);
  const [bio, setBio] = useState(initialBio);
  const [isSaving, setIsSaving] = useState(false);

  const expertiseTags = useMemo(
    () =>
      expertise
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [expertise],
  );

  const canSave =
    fullName.trim().length > 0 &&
    department.trim().length > 0 &&
    title.trim().length > 0;

  function handleSubmit(event) {
    event.preventDefault();
    if (isSaving || !canSave) return;
    setIsSaving(true);
    onSave({
      id: initialEmail.toLowerCase(),
      name: fullName.trim() || initialName,
      email: initialEmail,
      role: initialRole,
      department: department.trim() || "Research Cell",
      title: title.trim() || "Faculty",
      office: office.trim() || "",
      expertise: expertiseTags,
      bio: bio.trim(),
    });
  }

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", bgcolor: "#F1F5F9", px: { xs: 2, sm: 3, lg: 4 }, py: 5 }}
    >
      <Card
        sx={{
          mx: "auto",
          maxWidth: 768,
          borderRadius: "32px",
          border: "1px solid #D9E2EC",
          boxShadow: "0 10px 30px rgba(11,45,77,0.08)",
          p: { xs: 3, sm: 4 },
        }}
      >
        {/* Header banner */}
        <Box sx={{ mb: 4, bgcolor: "#F1F5F9", borderRadius: "24px", p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#0B2D4D" }}>
            {isEdit ? "Update your researcher profile" : "Welcome to your new researcher profile"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5, maxWidth: 640, color: "#4B5563", lineHeight: 1.7 }}>
            {isEdit
              ? "Edit your profile details so your colleagues and dashboard stay current."
              : "Complete your profile so the dashboard can show your department, expertise, and contact details. This is the first step after signing in with Google."}
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Name + Email */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, display: "flex", alignItems: "center", gap: 1 }}>
                Full name
                <Chip label="Required" size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.625rem", letterSpacing: "0.12em" }} />
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Meera Iyer"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Email address</Typography>
              <TextField
                fullWidth
                size="small"
                value={initialEmail}
                disabled
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#F1F5F9" } }}
              />
            </Grid>
          </Grid>

          {/* Role + Department + Title */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Role</Typography>
              <TextField
                fullWidth
                size="small"
                value={initialRole}
                disabled
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#F1F5F9" } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, display: "flex", alignItems: "center", gap: 1 }}>
                Department
                <Chip label="Required" size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.625rem", letterSpacing: "0.12em" }} />
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: "16px" }}
                >
                  <MenuItem value="" disabled>Select a department</MenuItem>
                  {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, display: "flex", alignItems: "center", gap: 1 }}>
                Title
                <Chip label="Required" size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.625rem", letterSpacing: "0.12em" }} />
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{ borderRadius: "16px" }}
                >
                  {TITLES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Office */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Office location</Typography>
            <TextField
              fullWidth
              size="small"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              placeholder="Research Cell, Block B"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            />
          </Box>

          {/* Expertise */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Expertise</Typography>
            <TextField
              fullWidth
              size="small"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="AI, Machine Learning, Security"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              Separate with commas; we will store each tag.
            </Typography>
          </Box>

          {/* Bio */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Bio</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Add a short profile summary to help colleagues identify you."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            />
          </Box>

          {/* Expertise preview */}
          {expertiseTags.length > 0 && (
            <Box sx={{ borderRadius: "24px", border: "1px solid #D9E2EC", bgcolor: "#F1F5F9", p: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Expertise preview</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                {expertiseTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{ bgcolor: "white", color: "#4B5563", border: "1px solid #D9E2EC", fontWeight: 500 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Save row */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {isEdit ? "Update your profile" : "One more step"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isEdit ? "Save updates to your profile details." : "Save your profile to continue into the dashboard."}
              </Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              disabled={!canSave || isSaving}
              startIcon={isSaving ? <LoadingSpinner size={16} color="inherit" /> : null}
              sx={{
                bgcolor: "#0B2D4D",
                "&:hover": { bgcolor: "#005B96" },
                px: 3,
                py: 1.5,
                borderRadius: "16px",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
              }}
            >
              {isSaving
                ? isEdit ? "Saving profile..." : "Saving and continuing..."
                : isEdit ? "Save profile" : "Save profile and continue"}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}



