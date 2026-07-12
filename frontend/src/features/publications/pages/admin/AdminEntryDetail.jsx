import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import LoadingSpinner from "../../components/LoadingSpinner";

function statusDisplay(status) {
  const map = {
    in_review: "In review",
    changes_requested: "Changes requested",
    approved_for_publication: "Approved for publication",
    published: "Published",
    draft: "Draft",
    closed: "Closed",
  };
  return map[status] ?? status;
}

function statusChipProps(status) {
  if (status === "in_review") return { bgcolor: "rgba(0,166,200,0.12)", color: "#0077B6" };
  if (status === "changes_requested") return { bgcolor: "rgba(217,119,6,0.12)", color: "#D97706" };
  if (status === "approved_for_publication") return { bgcolor: "rgba(22,128,60,0.12)", color: "#16803C" };
  if (status === "published") return { bgcolor: "rgba(0,150,136,0.12)", color: "#009688" };
  if (status === "closed") return { bgcolor: "#E2E8F0", color: "#475569" };
  return { bgcolor: "#F1F5F9", color: "#1F2933" };
}

export default function AdminEntryDetail({ entries, setEntries, userEmail, addEntryNotification }) {
  const navigate = useNavigate();
  const { entryId } = useParams();
  const [loadingStatus, setLoadingStatus] = useState(null);

  const entry = useMemo(() => entries.find((item) => item.id === entryId), [entries, entryId]);

  if (!entry) {
    return (
      <Box component="section">
        <Card sx={{ borderRadius: "24px", p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Entry not found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            We could not find that entry. Try returning to the admin publications list or review queue.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/publications-tracker/admin/publications")}
            sx={{ mt: 3, bgcolor: "#0B2D4D", "&:hover": { bgcolor: "#005B96" }, borderRadius: "16px", textTransform: "none" }}
          >
            Back to publications
          </Button>
        </Card>
      </Box>
    );
  }

  async function updateStatus(nextStatus, actionLabel, timelineNote) {
    if (!entry) return;
    const timelineEvent = {
      id: Math.random().toString(36).slice(2, 8),
      kind: actionLabel,
      actor: userEmail || "Admin",
      at: new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      note: timelineNote,
      details: { fromStatus: entry.status, toStatus: nextStatus },
    };
    setLoadingStatus(nextStatus);
    try {
      const response = await fetch(`/api/publications/${entry.id}/status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, timelineEvent }),
      });
      if (!response.ok) throw new Error("Failed to update publication status");
      const { item } = await response.json();
      setEntries((current) => current.map((e) => (e.id === item.id ? item : e)));
      addEntryNotification(`Entry ${statusDisplay(nextStatus)}`, timelineNote);
    } catch (error) {
      console.error(error);
      addEntryNotification("Admin action failed", "Unable to update entry status.");
    } finally {
      setLoadingStatus(null);
    }
  }

  const cp = statusChipProps(entry.status);

  return (
    <Box component="section">
      {/* Page header */}
      <Box sx={{ mb: 3, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "flex-end" }, justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "text.secondary" }}>
            Admin entry viewer
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: "#1F2933" }}>{entry.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Department: {entry.department} · Owner: {entry.owner} · Status:{" "}
            <Box component="span" sx={{ color: cp.color, fontWeight: 600 }}>{statusDisplay(entry.status)}</Box>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/publications-tracker/admin")}
            sx={{ borderColor: "#D9E2EC", color: "#1F2933", "&:hover": { bgcolor: "#F1F5F9" }, borderRadius: "16px", textTransform: "none", fontWeight: 600 }}
          >
            Back to admin dashboard
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/publications-tracker/admin/publications")}
            sx={{ bgcolor: "#1F2933", "&:hover": { bgcolor: "#0B2D4D" }, borderRadius: "16px", textTransform: "none", fontWeight: 600 }}
          >
            Back to publications
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main column */}
        <Grid size={{ xs: 12, xl: 7 }}  >
          <Stack spacing={3}>
            {/* Summary card */}
            <Card sx={{ borderRadius: "24px", p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.28em", color: "text.secondary" }}>Summary</Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 600, color: "#1F2933" }}>{entry.title}</Typography>
                </Box>
                <Chip label={statusDisplay(entry.status)} size="small" sx={{ ...cp, fontWeight: 700, flexShrink: 0 }} />
              </Box>
              <Typography variant="body2" sx={{ lineHeight: 1.75, color: "#4B5563" }}>
                {entry.summary || "No summary is available for this entry."}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}  >
                  <Box sx={{ borderRadius: "24px", bgcolor: "#F1F5F9", p: 2 }}>
                    <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.28em", color: "text.secondary" }}>Contributors</Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#1F2933" }}>
                      {entry.contributors.length > 0 ? entry.contributors.join(", ") : "None assigned"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}  >
                  <Box sx={{ borderRadius: "24px", bgcolor: "#F1F5F9", p: 2 }}>
                    <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.28em", color: "text.secondary" }}>Last update</Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#1F2933" }}>{entry.updatedAt}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>

            {/* Review actions */}
            <Card sx={{ borderRadius: "24px", p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "text.secondary" }}>Admin workflow</Typography>
                  <Typography variant="h6" sx={{ mt: 0.75, fontWeight: 600 }}>Review actions</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">{entry.messages.length} messages</Typography>
              </Box>
              <Grid container spacing={1.5}>
                {(entry.status === "in_review" || entry.status === "changes_requested") && (
                  <Grid size={{ xs: 12, sm: 4 }}  >
                    <Button
                      fullWidth
                      disabled={loadingStatus !== null}
                      onClick={() => updateStatus("approved_for_publication", "ReviewApproved", "Approved for publication")}
                      startIcon={loadingStatus === "approved_for_publication" ? <LoadingSpinner size={16} color="inherit" /> : null}
                      sx={{ bgcolor: "rgba(22,128,60,0.1)", color: "#16803C", "&:hover": { bgcolor: "rgba(22,128,60,0.18)" }, borderRadius: "16px", textTransform: "none", fontWeight: 600, py: 1.25 }}
                    >
                      {loadingStatus === "approved_for_publication" ? "Approving..." : "Approve"}
                    </Button>
                  </Grid>
                )}
                {entry.status === "in_review" && (
                  <Grid size={{ xs: 12, sm: 4 }}  >
                    <Button
                      fullWidth
                      disabled={loadingStatus !== null}
                      onClick={() => updateStatus("changes_requested", "ReviewRejected", "Requested changes")}
                      startIcon={loadingStatus === "changes_requested" ? <LoadingSpinner size={16} color="inherit" /> : null}
                      sx={{ bgcolor: "rgba(217,119,6,0.1)", color: "#D97706", "&:hover": { bgcolor: "rgba(217,119,6,0.18)" }, borderRadius: "16px", textTransform: "none", fontWeight: 600, py: 1.25 }}
                    >
                      {loadingStatus === "changes_requested" ? "Requesting..." : "Request changes"}
                    </Button>
                  </Grid>
                )}
                {entry.status === "approved_for_publication" && (
                  <Grid size={{ xs: 12, sm: 4 }}  >
                    <Button
                      fullWidth
                      disabled={loadingStatus !== null}
                      onClick={() => updateStatus("published", "Merged", "Published")}
                      startIcon={loadingStatus === "published" ? <LoadingSpinner size={16} color="inherit" /> : null}
                      sx={{ bgcolor: "#0B2D4D", color: "white", "&:hover": { bgcolor: "#005B96" }, borderRadius: "16px", textTransform: "none", fontWeight: 600, py: 1.25 }}
                    >
                      {loadingStatus === "published" ? "Publishing..." : "Publish"}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Card>

            {/* Timeline */}
            <Card sx={{ borderRadius: "24px", p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Timeline</Typography>
              <Stack spacing={1.5}>
                {entry.timeline.length > 0 ? (
                  entry.timeline.map((event) => (
                    <Box key={event.id} sx={{ borderRadius: "16px", bgcolor: "#F1F5F9", p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1F2933" }}>{event.kind}</Typography>
                        <Typography variant="caption" color="text.secondary">{event.at}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{event.note}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No timeline events have been added yet.</Typography>
                )}
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Aside column */}
        <Grid size={{ xs: 12, xl: 5 }}  >
          <Stack spacing={3}>
            <Card sx={{ borderRadius: "24px", p: 3 }}>
              <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "text.secondary" }}>
                Quick facts
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {[
                  { label: "Owner", value: entry.owner },
                  { label: "Department", value: entry.department },
                  { label: "Status", value: statusDisplay(entry.status) },
                  { label: "Contributors", value: entry.contributors.length },
                  { label: "Versions", value: entry.versions.length },
                ].map(({ label, value }) => (
                  <Typography key={label} variant="body2" sx={{ color: "#4B5563" }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>{label}:</Box> {value}
                  </Typography>
                ))}
              </Stack>
            </Card>

            <Card sx={{ borderRadius: "24px", p: 3, bgcolor: "#F1F5F9" }}>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3em", color: "text.secondary" }}>
                Admin-only controls
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                This view is exclusively for admin auditing and review. You can return to the admin dashboard or publications list without leaving the admin section.
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate(`/publications-tracker/dashboard/entries/${entry.id}`, { state: { returnTo: "/admin" } })}
                sx={{ mt: 2, borderColor: "#D9E2EC", color: "#1F2933", "&:hover": { bgcolor: "white" }, borderRadius: "16px", textTransform: "none", fontWeight: 600 }}
              >
                Open in user dashboard
              </Button>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}



