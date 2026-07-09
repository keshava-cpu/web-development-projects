import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getDirectoryUserLabel } from "../../mockData";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PublishIcon from "@mui/icons-material/Publish";
import CommentIcon from "@mui/icons-material/Comment";
import HistoryIcon from "@mui/icons-material/History";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import Paper from "@mui/material/Paper";

// Map legacy status class strings to MUI sx props
const STATUS_SX = {
  "bg-surface-100 text-brand-900": { bgcolor: "#F1F5F9", color: "#1F2933" },
  "bg-brand-600/10 text-brand-700": { bgcolor: "rgba(0,166,200,0.12)", color: "#0077B6" },
  "bg-warning/10 text-warning": { bgcolor: "rgba(217,119,6,0.12)", color: "#D97706" },
  "bg-success/10 text-success": { bgcolor: "rgba(22,128,60,0.12)", color: "#16803C" },
  "bg-brand-500/10 text-brand-500": { bgcolor: "rgba(0,150,136,0.12)", color: "#009688" },
  "bg-slate-200 text-slate-700": { bgcolor: "#E2E8F0", color: "#475569" },
};

const KIND_EMOJI = {
  Edited: "📝", Created: "✨", ReviewRequested: "📋", ReviewApproved: "✅",
  ReviewRejected: "❌", Merged: "🔀", StatusChanged: "🔄", CommentAdded: "💬",
  Closed: "🔒", Reopened: "🔓",
};

const DashboardDetailView = ({
  sidebarCollapsed, setSidebarCollapsed,
  setSearch, search,
  filteredEntries, statusLabels, selectedEntry, userEmail,
  statusClasses, shortId, nowStamp,
  setEntries, addEntryNotification,
  setSelectedVersion, selectedVersion,
  selectedEntryId, selectEntry, isAdmin, users,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnToAdmin = location.state?.returnTo;
  const [sidebarStatusFilter, setSidebarStatusFilter] = useState("all");

  const SIDEBAR_STATUS_FILTERS = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Review", value: "in_review" },
    { label: "Changes", value: "changes_requested" },
    { label: "Approved", value: "approved_for_publication" },
    { label: "Published", value: "published" },
    { label: "Closed", value: "closed" },
  ];

  const sidebarFiltered = useMemo(() => {
    if (sidebarStatusFilter === "all") return filteredEntries;
    return filteredEntries.filter((e) => e.status === sidebarStatusFilter);
  }, [filteredEntries, sidebarStatusFilter]);

  const openProfile = (identifier) =>
    navigate(`/publications-tracker/profile?search=${encodeURIComponent(identifier)}&view=${encodeURIComponent(identifier)}&section=directory`);

  const statusSx = (statusKey) => STATUS_SX[statusClasses[statusKey]] ?? { bgcolor: "#F1F5F9", color: "#1F2933" };

  async function handleStatusChange(nextStatus, kind, note) {
    const timelineEvent = {
      id: shortId(),
      kind,
      actor: userEmail || "Unknown",
      at: nowStamp(),
      note,
      details: { fromStatus: selectedEntry.status, toStatus: nextStatus },
    };
    try {
      const response = await fetch(`/api/publications/${selectedEntryId}/status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, timelineEvent }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      const result = await response.json();
      setEntries((current) => current.map((e) => (e.id === selectedEntryId ? result.item : e)));
      addEntryNotification(statusLabels[nextStatus] ?? note, note);
    } catch (err) {
      console.error(err);
      addEntryNotification("Error", `Failed: ${note}`);
    }
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", flexDirection: "column", bgcolor: "#FAFCFE" }}>
      <Box sx={{ display: "flex", width: "100%", flex: 1, flexDirection: { xs: "column", lg: "row" } }}>

        {/* Mobile: collapsed rail toggle */}
        {sidebarCollapsed && (
          <Box sx={{ borderBottom: "1px solid #D9E2EC", bgcolor: "white", px: 1.5, py: 1.5, display: { lg: "none" } }}>
            <ButtonBase
              onClick={() => setSidebarCollapsed(false)}
              sx={{ width: "100%", borderRadius: "16px", border: "1px solid #D9E2EC", bgcolor: "#FAFCFE", px: 2, py: 1.5, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit", fontWeight: 600, fontSize: "0.875rem", color: "#0B2D4D", boxShadow: 1, "&:hover": { bgcolor: "white" } }}
            >
              Open entry rail
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </ButtonBase>
          </Box>
        )}

        {/* Sidebar */}
        <Box
          component="aside"
          sx={{
            zIndex: 20,
            bgcolor: "white",
            boxShadow: 1,
            transition: "all 0.3s",
            display: sidebarCollapsed ? { xs: "none", lg: "flex" } : "flex",
            width: sidebarCollapsed ? { lg: 64 } : { xs: "100%", lg: 320 },
            flexDirection: "column",
            flexShrink: 0,
            position: { lg: "sticky" },
            top: { lg: 108 },
            height: { lg: "calc(100vh - 108px)" },
          }}
        >
          {/* Sidebar header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              background: "linear-gradient(to right, #0B2D4D, #1F2933)",
              px: 2,
              py: 2,
              color: "white",
            }}
          >
            {!sidebarCollapsed && (
              <Box>
                <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.35em", color: "rgba(255,255,255,0.6)", fontSize: "0.6rem" }}>
                  Entry rail
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 0.25, fontWeight: 600, color: "white" }}>
                  Entries
                </Typography>
              </Box>
            )}
            <IconButton
              onClick={() => setSidebarCollapsed((c) => !c)}
              aria-label={sidebarCollapsed ? "Expand entry sidebar" : "Collapse entry sidebar"}
              size="small"
              sx={{ border: "1px solid rgba(255,255,255,0.2)", bgcolor: "rgba(255,255,255,0.1)", color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}
            >
              {sidebarCollapsed ? <ChevronRightIcon sx={{ fontSize: 16 }} /> : <ChevronLeftIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Box>

          {!sidebarCollapsed && (
            <Box sx={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden", p: 2 }}>
              {/* Search */}
              <TextField
                size="small"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "white" } }}
              />

              {/* Status filter chips */}
              <Box sx={{ mt: 1.5, borderRadius: "12px", bgcolor: "#F1F5F9", p: 1.25, border: "1px solid #E2E8F0" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                  <FilterListIcon sx={{ fontSize: 13, color: "#64748B" }} />
                  <Typography variant="caption" sx={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#64748B", fontWeight: 700 }}>Filter by status</Typography>
                  <Chip label={`${sidebarFiltered.length} shown`} size="small" sx={{ ml: "auto", height: 16, fontSize: "0.58rem", bgcolor: "rgba(0,119,182,0.12)", color: "#0077B6", fontWeight: 700, border: "1px solid rgba(0,119,182,0.2)" }} />
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {SIDEBAR_STATUS_FILTERS.map((f) => {
                    const isActive = sidebarStatusFilter === f.value;
                    return (
                      <Chip
                        key={f.value}
                        label={f.label}
                        size="small"
                        onClick={() => setSidebarStatusFilter(f.value)}
                        sx={{
                          cursor: "pointer",
                          height: 22,
                          fontSize: "0.6rem",
                          fontWeight: isActive ? 700 : 500,
                          bgcolor: isActive ? "#0B2D4D" : "white",
                          color: isActive ? "white" : "#475569",
                          border: "1px solid",
                          borderColor: isActive ? "#0B2D4D" : "#CBD5E1",
                          transition: "all 0.15s",
                          boxShadow: isActive ? "0 1px 4px rgba(11,45,77,0.18)" : "none",
                          "&:hover": { bgcolor: isActive ? "#005B96" : "#E2E8F0", borderColor: isActive ? "#005B96" : "#94A3B8" },
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* Entry list */}
              <Box
                sx={{
                  mt: 2,
                  flex: 1,
                  minHeight: { xs: 200, lg: 0 },
                  maxHeight: { xs: 340, lg: "none" },
                  overflowY: "auto",
                  overflowX: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  pr: 0.5,
                }}
                className="thin-scroll"
              >
                {sidebarFiltered.map((entry) => {
                  const isSelected = entry.id === selectedEntryId;
                  const chipSx = statusSx(entry.status);
                  return (
                    <ButtonBase
                      component="div"
                      key={entry.id}
                      onClick={() => selectEntry(entry.id)}
                      sx={{
                        width: "100%",
                        textAlign: "left",
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: isSelected ? "primary.main" : "divider",
                        bgcolor: isSelected ? "rgba(0,119,182,0.02)" : "background.paper",
                        p: 1.75,
                        boxShadow: isSelected ? "0 2px 8px rgba(0,119,182,0.06)" : "none",
                        transition: "all 0.15s ease-in-out",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          borderColor: isSelected ? "primary.main" : "primary.light",
                          bgcolor: isSelected ? "rgba(0,119,182,0.04)" : "#fafcfe",
                        },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        flexShrink: 0,
                        minHeight: "fit-content",
                        gap: 1,
                      }}
                    >
                      {/* Highlight Accent Bar */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 3,
                          bgcolor: isSelected ? "primary.main" : "transparent",
                        }}
                      />

                      <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: isSelected ? "primary.main" : "text.primary",
                            fontSize: "0.825rem",
                            lineHeight: 1.25,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            flex: 1,
                          }}
                        >
                          {entry.title}
                        </Typography>
                        <Chip
                          label={statusLabels[entry.status]}
                          size="small"
                          sx={{
                            ...chipSx,
                            fontWeight: 700,
                            flexShrink: 0,
                            height: 18,
                            fontSize: "0.58rem",
                            px: 0.5,
                          }}
                        />
                      </Box>

                      <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-end", gap: 1 }}>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.7rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {entry.owner}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {entry.department}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${entry.versions?.length || 1} v`}
                          size="small"
                          sx={{
                            bgcolor: isSelected ? "rgba(0,119,182,0.12)" : "action.hover",
                            color: isSelected ? "primary.main" : "text.secondary",
                            fontWeight: 700,
                            fontSize: "0.6rem",
                            height: 16,
                            px: 0.5,
                            flexShrink: 0,
                          }}
                        />
                      </Box>

                      <Box sx={{ borderTop: "1px solid", borderColor: isSelected ? "rgba(0,119,182,0.12)" : "divider", my: 0.25 }} />

                      <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
                          {entry.latestFile && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                              <DescriptionOutlinedIcon sx={{ fontSize: 12, color: "text.secondary", flexShrink: 0 }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                {entry.latestFile}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                            <PeopleOutlineIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                              {entry.contributors.length}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
                          <AccessTimeOutlinedIcon sx={{ fontSize: 11, color: "text.secondary" }} />
                          <Typography variant="caption" sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
                            {entry.updatedAt}
                          </Typography>
                        </Box>
                      </Box>
                    </ButtonBase>
                  );
                })}
                {filteredEntries.length === 0 && (
                  <Box sx={{ borderRadius: "12px", border: "1px dashed #D9E2EC", bgcolor: "#FAFCFE", p: 2.5, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">No entries found</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
          <Box component="section" sx={{ mx: "auto", maxWidth: 1280, position: "relative" }}>
            {/* Admin return FAB */}
            {returnToAdmin && isAdmin && (
              <Fab
                size="medium"
                onClick={() => navigate(returnToAdmin)}
                aria-label="Return to admin view"
                sx={{
                  position: "fixed",
                  right: { xs: 12, sm: 24 },
                  top: { xs: 12, sm: 24 },
                  zIndex: 40,
                  bgcolor: "#0B2D4D",
                  color: "white",
                  "&:hover": { bgcolor: "#005B96" },
                }}
              >
                <ArrowBackIcon />
              </Fab>
            )}

            <Box sx={{ mx: "auto", maxWidth: 1280, px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
              {/* Page heading row */}
              <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.25em", color: "text.secondary" }}>
                    Dashboard
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 600, color: "#0B2D4D" }}>
                    Entry details
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/publications-tracker/dashboard")}
                  sx={{ borderColor: "#D9E2EC", color: "#1F2933", "&:hover": { bgcolor: "#F1F5F9", borderColor: "#93C5FD" }, borderRadius: "20px", textTransform: "none", fontWeight: 600, boxShadow: 1 }}
                >
                  Back to list
                </Button>
              </Box>

              {/* Entry detail article */}
              <Card sx={{ borderRadius: "28px", p: { xs: 2, sm: 3 }, boxShadow: "0 10px 30px rgba(11,45,77,0.08)" }}>
                {/* Article header */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 2, borderBottom: "1px solid #D9E2EC", pb: 2.5, mb: 3 }}>
                  <Box>
                    <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.25em", color: "text.secondary" }}>
                      Selected entry
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, fontWeight: 600, color: "#0B2D4D" }}>
                      {selectedEntry?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {selectedEntry?.owner} · {selectedEntry?.department}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      {!isAdmin && (selectedEntry?.owner === userEmail || (selectedEntry?.contributors?.includes(userEmail) ?? false)) && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/publications-tracker/dashboard/entries/${selectedEntryId}/edit`)}
                          sx={{ borderColor: "#D9E2EC", color: "#1F2933", "&:hover": { bgcolor: "#F1F5F9" }, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
                        >
                          ✏️ Edit
                        </Button>
                      )}
                      <Chip
                        label={statusLabels[selectedEntry?.status ?? "draft"]}
                        size="small"
                        sx={{ ...statusSx(selectedEntry?.status ?? "draft"), fontWeight: 700 }}
                      />
                    </Box>

                    {/* Status transition buttons */}
                    {selectedEntry && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {selectedEntry.status === "draft" && (
                          <Button
                            size="small"
                            onClick={() => handleStatusChange("in_review", "ReviewRequested", "Submitted for review")}
                            sx={{ bgcolor: "rgba(0,119,182,0.1)", color: "#0077B6", "&:hover": { bgcolor: "rgba(0,119,182,0.18)" }, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
                          >
                            📋 Request Review
                          </Button>
                        )}
                        {(selectedEntry.status === "in_review" || selectedEntry.status === "changes_requested") && isAdmin && (
                          <>
                            <Button
                              size="small"
                              onClick={() => handleStatusChange("approved_for_publication", "ReviewApproved", "Approved for publication")}
                              sx={{ bgcolor: "rgba(22,128,60,0.1)", color: "#16803C", "&:hover": { bgcolor: "rgba(22,128,60,0.18)" }, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
                            >
                              ✅ Approve
                            </Button>
                            <Button
                              size="small"
                              onClick={() => handleStatusChange("changes_requested", "ReviewRejected", "Changes requested")}
                              sx={{ bgcolor: "rgba(217,119,6,0.1)", color: "#D97706", "&:hover": { bgcolor: "rgba(217,119,6,0.18)" }, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
                            >
                              🔄 Request Changes
                            </Button>
                          </>
                        )}
                        {selectedEntry.status === "approved_for_publication" && isAdmin && (
                          <Button
                            size="small"
                            onClick={() => handleStatusChange("published", "Merged", "Published to main")}
                            sx={{ bgcolor: "rgba(22,128,60,0.1)", color: "#16803C", "&:hover": { bgcolor: "rgba(22,128,60,0.18)" }, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
                          >
                            🚀 Publish
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Content grid */}
                <Grid container spacing={3}>
                  {/* Left column */}
                  <Grid item xs={12} lg={7}>
                    <Stack spacing={3}>
                      {/* Summary */}
                      <Box sx={{ borderRadius: "16px", border: "1px solid #D9E2EC", bgcolor: "#FAFCFE", p: 2.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "text.secondary" }}>
                          Summary
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1.5, lineHeight: 1.75, color: "#1F2933" }}>
                          {selectedEntry?.summary || "No summary available for this entry yet."}
                        </Typography>
                      </Box>

                      {/* Timeline */}
                      <Box sx={{ borderRadius: "16px", border: "1px solid #D9E2EC", bgcolor: "white", p: 2.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "text.secondary" }}>
                          Activity Timeline
                        </Typography>
                        {(selectedEntry?.timeline ?? []).length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No activity yet.</Typography>
                        ) : (
                          <Timeline
                            position="right"
                            sx={{ p: 0, mt: 2, [`& .MuiTimelineItem-root:before`]: { display: "none" } }}
                          >
                            {(selectedEntry?.timeline ?? []).map((item, index) => {
                              let dotColor = "primary";
                              let icon = <HistoryIcon fontSize="small" sx={{ fontSize: "1rem", color: "white" }} />;
                              
                              if (item.kind === "Created") {
                                dotColor = "success";
                                icon = <AddIcon fontSize="small" sx={{ fontSize: "1rem", color: "white" }} />;
                              } else if (item.kind === "Edited") {
                                dotColor = "info";
                                icon = <EditIcon fontSize="small" sx={{ fontSize: "1rem", color: "white" }} />;
                              } else if (item.kind === "ReviewRequested") {
                                dotColor = "warning";
                                icon = <SendIcon fontSize="small" sx={{ fontSize: "1rem", color: "white" }} />;
                              } else if (item.kind === "ReviewApproved") {
                                dotColor = "success";
                                icon = <CheckIcon fontSize="small" sx={{ fontSize: "1rem", color: "white" }} />;
                              } else if (item.kind === "ReviewRejected") {
                                dotColor = "error";
                                icon = <CloseIcon fontSize="small" sx={{ fontSize: "1rem", color: "white" }} />;
                              } else if (item.kind === "Merged" || item.kind === "Published") {
                                dotColor = "success";
                                icon = <PublishIcon fontSize="small" sx={{ fontSize: "1rem", color: "white" }} />;
                              } else if (item.kind === "CommentAdded") {
                                dotColor = "secondary";
                                icon = <CommentIcon fontSize="small" sx={{ fontSize: "1rem", color: "white" }} />;
                              }

                              return (
                                <TimelineItem key={item.id} sx={{ minHeight: "auto" }}>
                                  <TimelineSeparator>
                                    <TimelineDot color={dotColor} sx={{ p: 0.75, boxShadow: 1 }}>
                                      {icon}
                                    </TimelineDot>
                                    {index < selectedEntry.timeline.length - 1 && <TimelineConnector />}
                                  </TimelineSeparator>
                                  <TimelineContent sx={{ py: 0.5, px: 2, mb: index < selectedEntry.timeline.length - 1 ? 2 : 0 }}>
                                    <Paper
                                      elevation={1}
                                      sx={{
                                        p: 2,
                                        borderRadius: "16px",
                                        border: "1px solid #D9E2EC",
                                        bgcolor: "#FAFCFE",
                                        transition: "all 0.15s",
                                        "&:hover": { borderColor: "#93C5FD", bgcolor: "white" },
                                      }}
                                    >
                                      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#0B2D4D" }}>
                                            {KIND_EMOJI[item.kind] ?? ""} {item.kind}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            by {item.actor}
                                          </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                          {item.at}
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.6, color: "#1F2933" }}>
                                        {item.note}
                                      </Typography>
                                      {item.details?.commitHash && (
                                        <Box sx={{ mt: 1.5, display: "flex", gap: 1 }}>
                                          <Box
                                            component="code"
                                            sx={{
                                              display: "inline-block",
                                              borderRadius: "6px",
                                              bgcolor: "white",
                                              px: 1,
                                              py: 0.25,
                                              fontSize: "0.72rem",
                                              fontFamily: "monospace",
                                              color: "#0077B6",
                                              border: "1px solid #D9E2EC",
                                            }}
                                          >
                                            {item.details.commitHash.slice(0, 7)}
                                          </Box>
                                        </Box>
                                      )}
                                      {item.details?.fromStatus && item.details?.toStatus && (
                                        <Chip
                                          label={`${statusLabels[item.details.fromStatus]} → ${statusLabels[item.details.toStatus]}`}
                                          size="small"
                                          sx={{ mt: 1.5, bgcolor: "white", color: "text.secondary", border: "1px solid #D9E2EC", fontSize: "0.7rem" }}
                                        />
                                      )}
                                    </Paper>
                                  </TimelineContent>
                                </TimelineItem>
                              );
                            })}
                          </Timeline>
                        )}
                      </Box>

                      {/* Versions */}
                      <Box sx={{ borderRadius: "16px", border: "1px solid #D9E2EC", bgcolor: "white", p: 2.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "text.secondary" }}>
                          Versions &amp; Commits
                        </Typography>
                        {(selectedEntry?.versions ?? []).length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No versions yet.</Typography>
                        )}
                        <Stack spacing={1} sx={{ mt: 2, maxHeight: 256, overflowY: "auto" }} className="thin-scroll">
                          {(selectedEntry?.versions ?? []).slice().reverse().map((version) => (
                            <ButtonBase
                              key={version.id}
                              type="button"
                              onClick={() => setSelectedVersion(selectedVersion === version.id ? null : version.id)}
                              sx={{
                                width: "100%",
                                textAlign: "left",
                                borderRadius: "10px",
                                border: "1px solid #D9E2EC",
                                p: 1.5,
                                transition: "background 0.15s",
                                "&:hover": { bgcolor: "#FAFCFE" },
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, width: "100%" }}>
                                <Box component="code" sx={{ fontSize: "0.72rem", fontFamily: "monospace", color: "#0077B6" }}>
                                  {version.commitHash?.slice(0, 7) || "—"}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: "#1F2933" }}>{version.commitMessage}</Typography>
                                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">{version.updatedAt}</Typography>
                                    {version.author && <Typography variant="caption" color="text.secondary">{version.author}</Typography>}
                                  </Box>
                                </Box>
                              </Box>
                              {selectedVersion === version.id && (
                                <Box sx={{ mt: 1.5, borderTop: "1px solid #D9E2EC", pt: 1.5 }}>
                                  <Typography variant="caption" color="text.secondary">📄 File: {version.fileName}</Typography>
                                </Box>
                              )}
                            </ButtonBase>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Right column: Collaborators */}
                  <Grid item xs={12} lg={5}>
                    <Box sx={{ borderRadius: "16px", border: "1px solid #D9E2EC", bgcolor: "white", p: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "text.secondary" }}>
                        Collaborators
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        {/* Owner */}
                        <ButtonBase
                          type="button"
                          onClick={() => openProfile(selectedEntry?.owner ?? "")}
                          sx={{ width: "100%", textAlign: "left", borderRadius: "10px", bgcolor: "#FAFCFE", p: 1.5, display: "flex", alignItems: "center", gap: 1.5, transition: "background 0.15s", "&:hover": { bgcolor: "#F1F5F9" } }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", bgcolor: "rgba(0,166,200,0.15)", fontSize: "0.75rem", fontWeight: 700, color: "#0077B6", flexShrink: 0 }}>
                            {getDirectoryUserLabel(selectedEntry?.owner ?? "", users).charAt(0).toUpperCase()}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: "#1F2933" }}>
                              {getDirectoryUserLabel(selectedEntry?.owner ?? "", users)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Owner · click to open profile</Typography>
                          </Box>
                        </ButtonBase>
                        {/* Contributors */}
                        {(selectedEntry?.contributors ?? []).map((contributor) => (
                          <ButtonBase
                            key={contributor}
                            type="button"
                            onClick={() => openProfile(contributor)}
                            sx={{ width: "100%", textAlign: "left", borderRadius: "10px", border: "1px solid #D9E2EC", p: 1.5, display: "flex", alignItems: "center", gap: 1.5, transition: "all 0.15s", "&:hover": { borderColor: "#93C5FD", bgcolor: "#EFF6FF" } }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", bgcolor: "rgba(0,119,182,0.1)", fontSize: "0.75rem", fontWeight: 700, color: "#0077B6", flexShrink: 0 }}>
                              {getDirectoryUserLabel(contributor, users).charAt(0).toUpperCase()}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "#1F2933" }}>
                                {getDirectoryUserLabel(contributor, users)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">Contributor · click to open profile</Typography>
                            </Box>
                          </ButtonBase>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardDetailView;

