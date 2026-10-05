import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import ButtonBase from "@mui/material/ButtonBase";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { departments } from "../../mockData";

function statusDisplay(status) {
  const map = {
    draft: "Draft",
    in_review: "In review",
    changes_requested: "Changes requested",
    approved_for_publication: "Approved",
    published: "Published",
    closed: "Closed",
  };
  return map[status] ?? status;
}

function statusChipProps(status) {
  if (status === "draft") return { bgcolor: "#E2E8F0", color: "#475569" };
  if (status === "in_review") return { bgcolor: "rgba(0,166,200,0.12)", color: "#0077B6" };
  if (status === "changes_requested") return { bgcolor: "rgba(217,119,6,0.12)", color: "#D97706" };
  if (status === "approved_for_publication") return { bgcolor: "rgba(22,128,60,0.12)", color: "#16803C" };
  if (status === "published") return { bgcolor: "rgba(0,150,136,0.12)", color: "#009688" };
  if (status === "closed") return { bgcolor: "#E2E8F0", color: "#475569" };
  return { bgcolor: "#F1F5F9", color: "#1F2933" };
}

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "In Review", value: "in_review" },
  { label: "Changes Requested", value: "changes_requested" },
  { label: "Approved", value: "approved_for_publication" },
  { label: "Published", value: "published" },
  { label: "Closed", value: "closed" },
];

const DEPT_FILTERS = ["All", ...departments, "Research Cell"];

export default function AdminPublications({ entries }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("All");

  const totals = useMemo(
    () => ({
      total: entries.length,
      inReview: entries.filter((e) => e.status === "in_review").length,
      approved: entries.filter((e) => e.status === "approved_for_publication").length,
      published: entries.filter((e) => e.status === "published").length,
      changesRequested: entries.filter((e) => e.status === "changes_requested").length,
    }),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = entries;
    if (q) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.owner.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          (e.summary || "").toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") result = result.filter((e) => e.status === statusFilter);
    if (deptFilter !== "All") result = result.filter((e) => e.department === deptFilter);
    return result;
  }, [entries, query, statusFilter, deptFilter]);

  const statCards = [
    { label: "Total publications", value: totals.total, color: "#0077B6" },
    { label: "In review", value: totals.inReview, color: "#0077B6" },
    { label: "Approved", value: totals.approved, color: "#16803C" },
    { label: "Published", value: totals.published, color: "#009688" },
  ];

  const hasFilter = query || statusFilter !== "all" || deptFilter !== "All";

  return (
    <Box component="section">
      {/* Stats grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((s) => (
          <Grid size={{ xs: 6, lg: 3 }}   key={s.label}>
            <Card sx={{ borderRadius: "24px", p: 3 }}>
              <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "text.secondary", fontWeight: 600 }}>
                {s.label}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 700, color: s.color }}>
                {s.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search + Filter card */}
      <Card sx={{ borderRadius: "24px", p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <FilterListIcon sx={{ fontSize: 20, color: "#0B2D4D" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Search &amp; Filter Publications</Typography>
          <Chip
            label={`${filtered.length} of ${entries.length} entries`}
            size="small"
            sx={{ ml: "auto", bgcolor: "rgba(0,119,182,0.1)", color: "#0077B6", fontWeight: 700 }}
          />
        </Box>

        <TextField
          fullWidth size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, owner, department, or summary..."
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

        {/* Status filter */}
        <Box sx={{ mt: 2.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>Status</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
            {STATUS_FILTERS.map((f) => (
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

        {/* Department filter */}
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>Department</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
            {DEPT_FILTERS.map((dept) => (
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
            <Chip
              label="Clear all filters"
              size="small"
              onClick={() => { setQuery(""); setStatusFilter("all"); setDeptFilter("All"); }}
              sx={{ cursor: "pointer", bgcolor: "#FEF3C7", color: "#D97706", border: "1px solid rgba(217,119,6,0.25)", fontWeight: 600 }}
            />
          </Box>
        )}
      </Card>

      {/* Publications list */}
      <Card sx={{ borderRadius: "24px", overflow: "hidden" }}>
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "#F1F5F9", px: 3, py: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {hasFilter ? `Filtered Publications (${filtered.length})` : "All publications"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {hasFilter
              ? "Showing publications matching your search and filters."
              : "The full publication list is shown here so admins can inspect current status across departments."}
          </Typography>
        </Box>
        <Box>
          {filtered.length > 0 ? (
            filtered.map((entry, i) => {
              const cp = statusChipProps(entry.status);
              return (
                <Box key={entry.id}>
                  {i > 0 && <Divider />}
                  <ButtonBase
                    onClick={() => navigate(`/publications-tracker/admin/entries/${entry.id}`)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      px: 3,
                      py: 2.5,
                      textAlign: "left",
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "#F1F5F9" },
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "text.secondary" }}>
                        {entry.department}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600, color: "#1F2933" }}>
                        {entry.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        Owner: {entry.owner}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.75, flexShrink: 0 }}>
                      <Chip label={statusDisplay(entry.status)} size="small" sx={{ ...cp, fontWeight: 700 }} />
                      <Typography variant="caption" color="text.secondary">Updated {entry.updatedAt}</Typography>
                    </Box>
                  </ButtonBase>
                </Box>
              );
            })
          ) : (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                No publications match the selected filters.
              </Typography>
              <Chip
                label="Clear all filters"
                size="small"
                onClick={() => { setQuery(""); setStatusFilter("all"); setDeptFilter("All"); }}
                sx={{ mt: 1.5, cursor: "pointer", bgcolor: "#F1F5F9", color: "#475569" }}
              />
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
}

