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
import Divider from "@mui/material/Divider";
import { departments } from "../../mockData";
import UserMultiSelect from "../../components/UserMultiSelect";
import { useAuth } from "../../../../context/AuthContext";

const CreateEntryView = ({
  entryDraft,
  shortId,
  nowStamp,
  userEmail,
  emptyEntry,
  setEntries,
  setSelectedEntryId,
  setEntryDraft,
  addEntryNotification,
  users,
}) => {
  const navigate = useNavigate();
  const { token } = useAuth();

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        justifyContent: "center",
        overflowY: "auto",
        bgcolor: "#FAFCFE",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box
        component="section"
        sx={{
          mx: "auto",
          width: "100%",
          maxWidth: 896,
          flex: 1,
          py: { xs: 2, sm: 3 },
        }}
      >
        <Card
          sx={{
            borderRadius: "28px",
            p: { xs: 2.5, sm: 4 },
            boxShadow: "0 10px 30px rgba(11,45,77,0.08)",
          }}
        >
          {/* Card header */}
          <Box sx={{ mb: 4, borderBottom: "1px solid #D9E2EC", pb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#0B2D4D" }}>
              Create New Entry
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add comprehensive details for your R&D publication
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={async (e) => {
              e.preventDefault();
              const commitHash = shortId();
              const initialVersion = {
                id: shortId(),
                commitMessage: "Initial draft created",
                fileName: entryDraft.latestFile || "draft.pdf",
                updatedAt: nowStamp(),
                commitHash,
                author: userEmail || "Unknown",
              };
              const newEntry = {
                id: shortId(),
                title: entryDraft.title,
                department: entryDraft.department,
                owner: userEmail || "Unknown",
                contributors: entryDraft.contributors.length
                  ? entryDraft.contributors
                  : [userEmail || "Unknown"],
                status: "draft",
                summary: entryDraft.summary,
                latestFile: entryDraft.latestFile || "draft.pdf",
                updatedAt: nowStamp(),
                metrics: { messageCount: 0, impactPoints: 0 },
                versions: [initialVersion],
                timeline: [
                  {
                    id: shortId(),
                    kind: "Created",
                    actor: userEmail || "Unknown",
                    at: nowStamp(),
                    note: "Entry created",
                  },
                ],
                messages: [],
                adminNotes: [],
              };
              try {
                const response = await fetch("/api/keshava/publications", {
                  method: "POST",
                  credentials: "include",
                  // 👇 Fixed: Token is now correctly placed inside the headers block
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                  },
                  body: JSON.stringify(newEntry),
                });

                if (!response.ok)
                  throw new Error("Failed to create entry on server");

                const result = await response.json();
                setEntries((current) => [result.item, ...current]);
                setSelectedEntryId(result.item.id);
                setEntryDraft(emptyEntry);
                addEntryNotification(
                  "Entry created",
                  `"${result.item.title}" has been created successfully.`,
                );
                navigate(
                  `/publications-tracker/dashboard/entries/${result.item.id}`,
                );
              } catch (err) {
                console.error(err);
                addEntryNotification(
                  "Creation failed",
                  "Failed to save the entry to the server. " + String(err),
                );
              }
            }}
          >
            <Stack spacing={4}>
              {/* Basic Information */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#0B2D4D",
                  }}
                >
                  Basic Information
                </Typography>

                <Stack spacing={2.5} sx={{ mt: 2 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, mb: 0.75, color: "#1F2933" }}
                    >
                      Publication Title *
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      required
                      value={entryDraft.title}
                      onChange={(e) =>
                        setEntryDraft((c) => ({ ...c, title: e.target.value }))
                      }
                      placeholder="Enter the title of your publication"
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                      }}
                    />
                  </Box>

                  <Grid container spacing={2.5}>
                    <Grid xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 0.75, color: "#1F2933" }}
                      >
                        Department *
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
                        placeholder="e.g., research-v1.pdf"
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Box>

              <Divider />

              {/* Contributors */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#0B2D4D",
                  }}
                >
                  Contributors
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <UserMultiSelect
                    users={users}
                    selected={entryDraft.contributors}
                    onChange={(contributors) =>
                      setEntryDraft((c) => ({ ...c, contributors }))
                    }
                    label="Add contributors"
                    placeholder="Search by name, email, department, or expertise"
                  />
                </Box>
              </Box>

              <Divider />

              {/* Summary */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#0B2D4D",
                  }}
                >
                  Summary &amp; Description
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, mb: 0.75, color: "#1F2933" }}
                  >
                    Research Summary *
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={6}
                    value={entryDraft.summary}
                    onChange={(e) =>
                      setEntryDraft((c) => ({ ...c, summary: e.target.value }))
                    }
                    placeholder="Provide a comprehensive summary of your research, methodology, findings, and implications..."
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                    }}
                  />
                </Box>
              </Box>

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
                    boxShadow: 2,
                    textTransform: "none",
                  }}
                >
                  Create Entry
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate("/publications-tracker/dashboard")}
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
                  Cancel
                </Button>
              </Box>
            </Stack>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default CreateEntryView;
