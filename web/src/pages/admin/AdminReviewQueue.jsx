import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import LoadingSpinner from "@/components/LoadingSpinner";
import { departments } from "../../mockData";

function shortId() {
  return Math.random().toString(36).slice(2, 8);
}
function nowStamp() {
  return new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function statusDisplay(status) {
  const map = {
    in_review: "In review",
    changes_requested: "Changes requested",
    approved_for_publication: "Approved for publication",
    published: "Published",
    draft: "Draft",
  };
  return map[status] ?? status;
}
function statusChipProps(status) {
  if (status === "in_review") return { bgcolor: "rgba(0,166,200,0.12)", color: "#0077B6" };
  if (status === "changes_requested") return { bgcolor: "rgba(217,119,6,0.12)", color: "#D97706" };
  if (status === "approved_for_publication") return { bgcolor: "rgba(22,128,60,0.12)", color: "#16803C" };
  if (status === "published") return { bgcolor: "rgba(0,150,136,0.12)", color: "#009688" };
  return { bgcolor: "#F1F5F9", color: "#1F2933" };
}

const QUEUE_STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "In Review", value: "in_review" },
  { label: "Changes Requested", value: "changes_requested" },
  { label: "Approved", value: "approved_for_publication" },
];

export default function AdminReviewQueue({ entries, setEntries, userEmail, addEntryNotification }) {
  const navigate = useNavigate();
  const [loadingEntry, setLoadingEntry] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("All");

  const reviewEntries = entries.filter((e) =>
    ["in_review", "changes_requested", "approved_for_publication"].includes(e.status),
  );

  const filteredReviewEntries = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = reviewEntries;
    if (q) result = result.filter((e) => e.title.toLowerCase().includes(q) || e.owner.toLowerCase().includes(q) || e.department.toLowerCase().includes(q));
    if (statusFilter !== "all") result = result.filter((e) => e.status === statusFilter);
    if (deptFilter !== "All") result = result.filter((e) => e.department === deptFilter);
    return result;
  }, [reviewEntries, query, statusFilter, deptFilter]);

  const allDepts = useMemo(() => ["All", ...departments, "Research Cell"], []);
  const hasFilter = query || statusFilter !== "all" || deptFilter !== "All";

  if (!reviewEntries.length) {
    return (
      <Box component="section">
        <Card sx={{ borderRadius: "24px", p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Review queue</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            There are no entries waiting for admin review right now. Once faculty submit a publication for review, it will appear here.
          </Typography>
        </Card>
      </Box>
    );
  }


  async function handleStatusUpdate(entry, nextStatus, timelineKind, note) {
    setLoadingEntry(entry.id);
    const timelineEvent = {
      id: shortId(),
      kind: timelineKind,
      actor: userEmail || "Admin",
      at: nowStamp(),
      note,
      details: { fromStatus: entry.status, toStatus: nextStatus },
    };
    try {
      const response = await fetch(`/api/publications/${entry.id}/status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, timelineEvent }),
      });
      if (!response.ok) throw new Error("Failed to update publication status");
      const result = await response.json();
      setEntries((current) => current.map((item) => (item.id === entry.id ? result.item : item)));
      addEntryNotification(`Entry ${statusDisplay(nextStatus)}`, note);
    } catch (error) {
      console.error(error);
      addEntryNotification("Admin action failed", "Unable to update entry status.");
    } finally {
      setLoadingEntry(null);
    }
  }

  return (
    <Box component="section">
      {/* Header card */}
      <Card
        sx={{
          borderRadius: "24px",
          p: { xs: 3, sm: 4 },
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Review queue</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage entries that need admin approval, change requests, or publication.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate("/admin/publications")}
          sx={{ bgcolor: "#0B2D4D", "&:hover": { bgcolor: "#005B96" }, borderRadius: "16px", textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
        >
          View all publications
        </Button>
      </Card>

      {/* Search + Filter */}
      <Card sx={{ borderRadius: "24px", p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <FilterListIcon sx={{ fontSize: 20, color: "#0B2D4D" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Filter Queue</Typography>
          <Chip
            label={`${filteredReviewEntries.length} of ${reviewEntries.length} entries`}
            size="small"
            sx={{ ml: "auto", bgcolor: "rgba(0,119,182,0.1)", color: "#0077B6", fontWeight: 700 }}
          />
        </Box>
        <TextField
          fullWidth size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, owner, or department..."
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#FAFCFE" } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
        />
        {/* Status chips */}
        <Box sx={{ mt: 2.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>Status</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
            {QUEUE_STATUS_FILTERS.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                size="small"
                onClick={() => setStatusFilter(f.value)}
                sx={{
                  cursor: "pointer",
                  fontWeight: statusFilter === f.value ? 700 : 500,
                  bgcolor: statusFilter === f.value ? "#0B2D4D" : "#F1F5F9",
                  color: statusFilter === f.value ? "white" : "#475569",
                  border: "1px solid",
                  borderColor: statusFilter === f.value ? "#0B2D4D" : "#D9E2EC",
                  transition: "all 0.15s",
                  "&:hover": { bgcolor: statusFilter === f.value ? "#005B96" : "#E2E8F0" },
                }}
              />
            ))}
          </Box>
        </Box>
        {/* Dept chips */}
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>Department</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
            {allDepts.map((dept) => (
              <Chip
                key={dept}
                label={dept}
                size="small"
                onClick={() => setDeptFilter(dept)}
                sx={{
                  cursor: "pointer",
                  fontWeight: deptFilter === dept ? 700 : 500,
                  bgcolor: deptFilter === dept ? "rgba(0,119,182,0.12)" : "transparent",
                  color: deptFilter === dept ? "#0077B6" : "#64748B",
                  border: "1px solid",
                  borderColor: deptFilter === dept ? "rgba(0,119,182,0.3)" : "#D9E2EC",
                  transition: "all 0.15s",
                }}
              />
            ))}
          </Box>
        </Box>
        {hasFilter && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Chip label="Clear all filters" size="small" onClick={() => { setQuery(""); setStatusFilter("all"); setDeptFilter("All"); }} sx={{ cursor: "pointer", bgcolor: "#FEF3C7", color: "#D97706", border: "1px solid rgba(217,119,6,0.25)", fontWeight: 600 }} />
          </Box>
        )}
      </Card>

      {/* Entry cards */}
      {filteredReviewEntries.length > 0 ? (
        <Stack spacing={2}>
          {filteredReviewEntries.map((entry) => {
          const cp = statusChipProps(entry.status);
          return (
            <Card key={entry.id} sx={{ borderRadius: "24px", p: { xs: 2.5, sm: 3 }, bgcolor: "#F1F5F9" }}>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "flex-start" }, justifyContent: "space-between", gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "text.secondary" }}>
                    {entry.department}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>{entry.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    Owner: {entry.owner} · Last updated {entry.updatedAt}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={statusDisplay(entry.status)}
                    size="small"
                    sx={{ ...cp, fontWeight: 700 }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/admin/entries/${entry.id}`)}
                    sx={{ borderColor: "#D9E2EC", color: "#4B5563", "&:hover": { bgcolor: "#F1F5F9", borderColor: "#94a3b8" }, borderRadius: "20px", textTransform: "none", fontWeight: 500 }}
                  >
                    View details
                  </Button>
                </Box>
              </Box>

              {/* Action buttons */}
              <Grid container spacing={1.5} sx={{ mt: 2 }}>
                {(entry.status === "in_review" || entry.status === "changes_requested") && (
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      disabled={loadingEntry === entry.id}
                      onClick={() => handleStatusUpdate(entry, "approved_for_publication", "ReviewApproved", "Approved for publication")}
                      startIcon={loadingEntry === entry.id ? <LoadingSpinner size={16} color="inherit" /> : null}
                      sx={{ bgcolor: "rgba(22,128,60,0.1)", color: "#16803C", "&:hover": { bgcolor: "rgba(22,128,60,0.18)" }, borderRadius: "16px", textTransform: "none", fontWeight: 600, py: 1.25 }}
                    >
                      {loadingEntry === entry.id ? "Approving..." : "Approve"}
                    </Button>
                  </Grid>
                )}
                {entry.status === "in_review" && (
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      disabled={loadingEntry === entry.id}
                      onClick={() => handleStatusUpdate(entry, "changes_requested", "ReviewRejected", "Requested changes")}
                      startIcon={loadingEntry === entry.id ? <LoadingSpinner size={16} color="inherit" /> : null}
                      sx={{ bgcolor: "rgba(217,119,6,0.1)", color: "#D97706", "&:hover": { bgcolor: "rgba(217,119,6,0.18)" }, borderRadius: "16px", textTransform: "none", fontWeight: 600, py: 1.25 }}
                    >
                      {loadingEntry === entry.id ? "Requesting..." : "Request changes"}
                    </Button>
                  </Grid>
                )}
                {entry.status === "approved_for_publication" && (
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      disabled={loadingEntry === entry.id}
                      onClick={() => handleStatusUpdate(entry, "published", "Merged", "Published")}
                      startIcon={loadingEntry === entry.id ? <LoadingSpinner size={16} color="inherit" /> : null}
                      sx={{ bgcolor: "#0B2D4D", color: "white", "&:hover": { bgcolor: "#005B96" }, borderRadius: "16px", textTransform: "none", fontWeight: 600, py: 1.25 }}
                    >
                      {loadingEntry === entry.id ? "Publishing..." : "Publish"}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Card>
          );
          })}
        </Stack>
      ) : (
        <Card sx={{ borderRadius: "24px", p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>No entries match the selected filters.</Typography>
          {hasFilter && (
            <Chip label="Clear filters" size="small" onClick={() => { setQuery(""); setStatusFilter("all"); setDeptFilter("All"); }} sx={{ mt: 1.5, cursor: "pointer", bgcolor: "#F1F5F9", color: "#475569" }} />
          )}
        </Card>
      )}
    </Box>
  );
}
