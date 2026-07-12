import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import PublicationsListSkeleton from "../../../../components/skeletons/PublicationsListSkeleton";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "In Review", value: "in_review" },
  { label: "Changes Requested", value: "changes_requested" },
  { label: "Approved", value: "approved_for_publication" },
  { label: "Published", value: "published" },
  { label: "Closed", value: "closed" },
];

const DashboardListView = ({ search, setSearch, filteredEntries: allEntries, selectEntry, statusClasses, statusLabels, loading }) => {
  const [statusFilter, setStatusFilter] = useState("all");

  // Map legacy Tailwind class strings to MUI sx styles
  const statusSx = {
    "bg-surface-100 text-brand-900": { bgcolor: "#F1F5F9", color: "#1F2933" },
    "bg-brand-600/10 text-brand-700": { bgcolor: "rgba(0,166,200,0.12)", color: "#0077B6" },
    "bg-warning/10 text-warning": { bgcolor: "rgba(217,119,6,0.12)", color: "#D97706" },
    "bg-success/10 text-success": { bgcolor: "rgba(22,128,60,0.12)", color: "#16803C" },
    "bg-brand-500/10 text-brand-500": { bgcolor: "rgba(0,150,136,0.12)", color: "#009688" },
    "bg-slate-200 text-slate-700": { bgcolor: "#E2E8F0", color: "#475569" },
  };

  const filteredEntries = useMemo(() => {
    if (statusFilter === "all") return allEntries;
    return allEntries.filter((e) => e.status === statusFilter);
  }, [allEntries, statusFilter]);

  if (loading) {
    return (
      <Box sx={{ width: "100%", flex: 1, display: "flex", overflow: "hidden", bgcolor: "#FAFCFE" }}>
        <Box
          component="section"
          sx={{ mx: "auto", width: "100%", maxWidth: 1280, flex: 1, px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}
        >
          <PublicationsListSkeleton />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", flex: 1, display: "flex", overflow: "hidden", bgcolor: "#FAFCFE" }}>
      <Box
        component="section"
        sx={{ mx: "auto", width: "100%", maxWidth: 1280, flex: 1, px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}
      >
        <Card sx={{ borderRadius: "28px", bgcolor: "rgba(255,255,255,0.97)", p: { xs: 2, sm: 3 }, boxShadow: "0 10px 30px rgba(11,45,77,0.08)", backdropFilter: "blur(4px)" }}>
          {/* Header row */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "flex-end" },
              justifyContent: "space-between",
              gap: 2,
              borderBottom: "1px solid #D9E2EC",
              pb: 2.5,
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.25em", color: "text.secondary", userSelect: "none" }}>
                All entries
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 600, color: "#0B2D4D" }}>
                Publications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, userSelect: "none" }}>
                Select an entry to open the detailed dashboard.
              </Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", sm: 360 } }}>
              <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.2em", color: "text.secondary" }}>
                Search entries
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, owner, or department"
                sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#FAFCFE" } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearch("")}
                          edge="end"
                          aria-label="clear search"
                        >
                          <ClearIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Status filter chips */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
              <FilterListIcon sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.15em", color: "text.secondary", fontWeight: 600 }}>
                Filter by status
              </Typography>
              <Chip
                label={`${filteredEntries.length} shown`}
                size="small"
                sx={{ ml: "auto", bgcolor: "rgba(0,119,182,0.1)", color: "#0077B6", fontWeight: 700 }}
              />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {STATUS_FILTERS.map((f) => {
                const isActive = statusFilter === f.value;
                return (
                  <Chip
                    key={f.value}
                    label={f.label}
                    size="small"
                    onClick={() => setStatusFilter(f.value)}
                    sx={{
                      cursor: "pointer",
                      fontWeight: isActive ? 700 : 500,
                      bgcolor: isActive ? "#0B2D4D" : "#F1F5F9",
                      color: isActive ? "white" : "#475569",
                      border: "1px solid",
                      borderColor: isActive ? "#0B2D4D" : "#D9E2EC",
                      transition: "all 0.15s",
                      "&:hover": { bgcolor: isActive ? "#005B96" : "#E2E8F0" },
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Entry list */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {filteredEntries.map((entry) => {
              const chipSx = statusSx[statusClasses[entry.status]] ?? { bgcolor: "#F1F5F9", color: "#1F2933" };
              return (
                <ButtonBase
                  key={entry.id}
                  onClick={() => selectEntry(entry.id)}
                  sx={{
                    width: "100%",
                    textAlign: "left",
                    borderRadius: "16px",
                    border: "1px solid #D9E2EC",
                    bgcolor: "#FAFCFE",
                    p: { xs: 1.5, sm: 2 },
                    transition: "all 0.2s",
                    "&:hover": { transform: "translateY(-2px)", borderColor: "#93C5FD", bgcolor: "white", boxShadow: "0 4px 12px rgba(11,45,77,0.08)" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 1.5, sm: 2 }, width: "100%" }}>
                    {/* Accent bar */}
                    <Box sx={{ mt: 0.5, width: 6, height: 44, borderRadius: "999px", bgcolor: "rgba(0,119,182,0.2)", flexShrink: 0, transition: "background 0.2s", "&:hover": { bgcolor: "#0077B6" } }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "#0B2D4D", transition: "color 0.15s" }}>
                            {entry.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {entry.owner} · {entry.department}
                          </Typography>
                        </Box>
                        <Chip label={statusLabels[entry.status]} size="small" sx={{ ...chipSx, fontWeight: 700, flexShrink: 0, boxShadow: 1 }} />
                      </Box>
                      <Box sx={{ overflowX: "auto", mt: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                          {entry.summary || "No summary available."}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </ButtonBase>
              );
            })}

            {filteredEntries.length === 0 && (
              <Box sx={{ borderRadius: "16px", border: "1px dashed #D9E2EC", bgcolor: "#FAFCFE", p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">No entries match your search or filter.</Typography>
                {statusFilter !== "all" && (
                  <Chip
                    label="Clear status filter"
                    size="small"
                    onClick={() => setStatusFilter("all")}
                    sx={{ mt: 1, cursor: "pointer", bgcolor: "#F1F5F9", color: "#475569" }}
                  />
                )}
              </Box>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardListView;
