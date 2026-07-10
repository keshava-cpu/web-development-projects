import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
// import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { departments } from "../../mockData";
import UserMultiSelect from "../../components/UserMultiSelect";
import { useAuth } from "../../../../context/AuthContext";

const EditEntryView = ({
  selectedEntry,
  selectedEntryId,
  userEmail,
  commitMessage,
  shortId,
  nowStamp,
  entryDraft,
  setEntries,
  setCommitMessage,
  addEntryNotification,
  setEntryDraft,
  setSelectedEntryId,
  users,
}) => {
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    setSelectedEntryId(selectedEntryId);
  }, [selectedEntryId, setSelectedEntryId]);

  console.log(selectedEntry);

  return (
    <Box
      sx={{
        width: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FAFCFE",
        overflowY: "auto",
      }}
    >
      {/* Top context toolbar */}
      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{ borderBottom: "1px solid #D9E2EC", bgcolor: "white", zIndex: 10 }}
      >
        <Toolbar
          sx={{
            px: { xs: 2, sm: 3 },
            justifyContent: "space-between",
            minHeight: "56px !important",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize: "1rem !important" }} />}
              onClick={() => navigate("/publications-tracker/dashboard")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#0077B6",
                minWidth: "auto",
                px: 1.5,
              }}
            >
              Back
            </Button>
            <Box sx={{ borderLeft: "1px solid #D9E2EC", pl: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#0B2D4D", lineHeight: 1.2 }}
              >
                Edit Publication
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedEntry?.owner}
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<CloseIcon sx={{ fontSize: "1rem !important" }} />}
            onClick={() =>
              navigate(
                `/publications-tracker/dashboard/entries/${selectedEntryId}`,
              )
            }
            sx={{ textTransform: "none", fontWeight: 600, color: "#0077B6" }}
          >
            ⓧ Discard &amp; View
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", overflow: "auto" }}>
        {selectedEntry &&
        selectedEntry.owner !== userEmail &&
        !selectedEntry.contributors.includes(userEmail) ? (
          <Box sx={{ mx: "auto", maxWidth: 896, px: 3, py: 3 }}>
            <Box
              sx={{
                borderRadius: "16px",
                border: "2px solid rgba(217,119,6,0.3)",
                bgcolor: "rgba(217,119,6,0.05)",
                p: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box sx={{ mt: 0.25, flexShrink: 0, color: "#D97706" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: 24, height: 24 }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4v2m0 0a9 9 0 11-9-9m9 9a9 9 0 109-9"
                    />
                  </svg>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#D97706" }}
                  >
                    Access Denied
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "rgba(217,119,6,0.85)" }}
                  >
                    Only the entry owner or contributors can edit this
                    publication. This entry is owned by{" "}
                    <strong>{selectedEntry.owner}</strong>.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : selectedEntry ? (
          <Box
            component="form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!commitMessage.trim()) {
                addEntryNotification(
                  "Commit message required",
                  "Please enter a commit message describing your changes.",
                );
                return;
              }
              try {
                const commitHash = shortId();
                const newVersion = {
                  id: shortId(),
                  commitMessage: commitMessage.trim(),
                  fileName: entryDraft.latestFile,
                  updatedAt: nowStamp(),
                  commitHash,
                  author: userEmail || "Unknown",
                };
                const timelineEvent = {
                  id: shortId(),
                  kind: "Edited",
                  actor: userEmail || "Unknown",
                  at: nowStamp(),
                  note: commitMessage.trim(),
                  details: { commitHash },
                };
                const response = await fetch(
                  `/api/keshava/publications/${selectedEntryId}/update`,
                  {
                    method: "POST",
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                      title: entryDraft.title,
                      department: entryDraft.department,
                      contributors: entryDraft.contributors,
                      summary: entryDraft.summary,
                      latestFile: entryDraft.latestFile,
                      metrics: entryDraft.metrics,
                      newVersion,
                      timelineEvent,
                    }),
                  },
                );
                if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.message || "Failed to update entry");
                }
                const result = await response.json();
                setEntries((current) =>
                  current.map((entry) =>
                    entry.id === selectedEntryId ? result.item : entry,
                  ),
                );
                setCommitMessage("");
                addEntryNotification(
                  "Changes committed",
                  "Changes saved and committed successfully",
                );
                navigate(
                  `/publications-tracker/dashboard/entries/${selectedEntryId}`,
                );
              } catch (error) {
                addEntryNotification(
                  "Commit failed",
                  error instanceof Error
                    ? error.message
                    : "Failed to commit changes",
                );
              }
            }}
            sx={{
              mx: "auto",
              width: "100%",
              maxWidth: 1280,
              px: { xs: 2, sm: 3 },
              py: { xs: 2, sm: 3 },
            }}
          >
            <Stack spacing={3}>
              {/* Change diff preview */}
              <Stack spacing={2}>
                {entryDraft.title !== selectedEntry.title && (
                  <Card sx={{ borderRadius: "16px", p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "#0077B6",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#1F2933" }}
                      >
                        Title
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 500, color: "text.secondary" }}
                        >
                          Current
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.75,
                            borderRadius: "10px",
                            bgcolor: "#FAFCFE",
                            p: 1.5,
                            color: "#0077B6",
                            textDecoration: "line-through",
                          }}
                        >
                          {selectedEntry.title}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 500, color: "text.secondary" }}
                        >
                          New
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.75,
                            borderRadius: "10px",
                            bgcolor: "rgba(0,119,182,0.05)",
                            p: 1.5,
                            fontWeight: 500,
                            color: "#1F2933",
                          }}
                        >
                          {entryDraft.title}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                )}

                {entryDraft.summary !== selectedEntry.summary && (
                  <Card sx={{ borderRadius: "16px", p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "#0077B6",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#1F2933" }}
                      >
                        Summary
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 500, color: "text.secondary" }}
                        >
                          Current
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.75,
                            borderRadius: "10px",
                            bgcolor: "#FAFCFE",
                            p: 1.5,
                            color: "#0077B6",
                            maxHeight: 128,
                            overflowY: "auto",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {selectedEntry.summary}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 500, color: "text.secondary" }}
                        >
                          New
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.75,
                            borderRadius: "10px",
                            bgcolor: "rgba(0,119,182,0.05)",
                            p: 1.5,
                            color: "#1F2933",
                            maxHeight: 128,
                            overflowY: "auto",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {entryDraft.summary}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                )}

                {/* Other changes */}
                <Card sx={{ borderRadius: "16px", p: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, mb: 2, color: "#1F2933" }}
                  >
                    Other Changes
                  </Typography>
                  <Stack spacing={0}>
                    {entryDraft.department !== selectedEntry.department && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: "1px solid #F1F5F9",
                          py: 1.5,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body2">
                          <Box
                            component="span"
                            sx={{
                              textDecoration: "line-through",
                              color: "#0077B6",
                              mr: 1,
                            }}
                          >
                            {selectedEntry.department}
                          </Box>
                          →
                          <Box
                            component="span"
                            sx={{ fontWeight: 600, color: "#1F2933", ml: 1 }}
                          >
                            {entryDraft.department}
                          </Box>
                        </Typography>
                      </Box>
                    )}
                    {entryDraft.latestFile !== selectedEntry.latestFile && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: "1px solid #F1F5F9",
                          py: 1.5,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          File
                        </Typography>
                        <Typography variant="body2">
                          <Box
                            component="span"
                            sx={{
                              textDecoration: "line-through",
                              color: "#0077B6",
                              mr: 1,
                            }}
                          >
                            {selectedEntry.latestFile}
                          </Box>
                          →
                          <Box
                            component="span"
                            sx={{ fontWeight: 600, color: "#1F2933", ml: 1 }}
                          >
                            {entryDraft.latestFile}
                          </Box>
                        </Typography>
                      </Box>
                    )}
                    {JSON.stringify(entryDraft.contributors) !==
                      JSON.stringify(selectedEntry.contributors) && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          py: 1.5,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Contributors
                        </Typography>
                        <Chip
                          label={`${entryDraft.contributors.length} members`}
                          size="small"
                          sx={{
                            color: "#0077B6",
                            bgcolor: "rgba(0,119,182,0.1)",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    )}
                  </Stack>
                </Card>
              </Stack>

              {/* Edit fields */}
              <Card sx={{ borderRadius: "16px", p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  📝 Edit Details
                </Typography>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, mb: 0.75, color: "#1F2933" }}
                    >
                      Title
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      required
                      value={entryDraft.title}
                      onChange={(e) =>
                        setEntryDraft((c) => ({ ...c, title: e.target.value }))
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                      }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 0.75, color: "#1F2933" }}
                      >
                        Department
                      </Typography>
                      <FormControl fullWidth size="small" required>
                        <Select
                          value={entryDraft.department}
                          onChange={(e) =>
                            setEntryDraft((c) => ({
                              ...c,
                              department: e.target.value,
                            }))
                          }
                          sx={{ borderRadius: "12px" }}
                        >
                          {departments.map((dept) => (
                            <MenuItem key={dept} value={dept}>
                              {dept}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 0.75, color: "#1F2933" }}
                      >
                        Latest File
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={entryDraft.latestFile}
                        onChange={(e) =>
                          setEntryDraft((c) => ({
                            ...c,
                            latestFile: e.target.value,
                          }))
                        }
                        placeholder="e.g., research-v2.pdf"
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, mb: 0.75, color: "#1F2933" }}
                    >
                      Summary
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      required
                      value={entryDraft.summary}
                      onChange={(e) =>
                        setEntryDraft((c) => ({
                          ...c,
                          summary: e.target.value,
                        }))
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                      }}
                    />
                  </Box>

                  <UserMultiSelect
                    users={users}
                    selected={entryDraft.contributors}
                    onChange={(contributors) =>
                      setEntryDraft((c) => ({ ...c, contributors }))
                    }
                    label="Contributors"
                    placeholder="Search by name, email, department, or expertise"
                  />
                </Stack>
              </Card>

              {/* Commit section */}
              <Card
                sx={{
                  borderRadius: "16px",
                  border: "2px solid rgba(0,119,182,0.2)",
                  bgcolor: "rgba(0,119,182,0.04)",
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                  💾 Commit Changes
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Describe what you changed and why.
                </Typography>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, mb: 0.75 }}
                  >
                    Commit Message
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    required
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="e.g., Updated methodology with latest experimental data from Q2 2026"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "white",
                      },
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Commits to: <strong>main</strong>
                </Typography>
              </Card>

              {/* Action buttons */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  borderTop: "1px solid #D9E2EC",
                  pt: 3,
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    flex: 1,
                    bgcolor: "#0077B6",
                    "&:hover": { bgcolor: "#005B96" },
                    borderRadius: "12px",
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    boxShadow: 2,
                  }}
                >
                  💾 Commit &amp; Save
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() =>
                    navigate(
                      `/publications-tracker/dashboard/entries/${selectedEntryId}`,
                    )
                  }
                  sx={{
                    borderColor: "#D9E2EC",
                    color: "#1F2933",
                    "&:hover": { bgcolor: "#F1F5F9" },
                    borderRadius: "12px",
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  Discard
                </Button>
              </Box>
            </Stack>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default EditEntryView;
