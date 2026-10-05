import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SchoolIcon from "@mui/icons-material/School";
import { departments, filterDirectoryUsers } from "../../mockData";

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

function UserCard({ user }) {
  return (
    <Box
      sx={{
        borderRadius: "16px",
        border: "1px solid #D9E2EC",
        bgcolor: "#FAFCFE",
        p: 2,
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        transition: "all 0.15s",
        "&:hover": { bgcolor: "white", borderColor: "#93C5FD", boxShadow: 1 },
      }}
    >
      <Avatar
        sx={{
          width: 44,
          height: 44,
          bgcolor: user.role === "admin" ? "#D97706" : "#0B2D4D",
          fontSize: "0.85rem",
          fontWeight: 700,
          flexShrink: 0,
          borderRadius: "12px",
        }}
      >
        {getInitials(user.name)}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#1F2933", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.name}
          </Typography>
          <Chip
            label={user.role}
            size="small"
            sx={{
              bgcolor: user.role === "admin" ? "rgba(217,119,6,0.12)" : "rgba(22,128,60,0.1)",
              color: user.role === "admin" ? "#D97706" : "#16803C",
              border: "1px solid",
              borderColor: user.role === "admin" ? "rgba(217,119,6,0.25)" : "rgba(22,128,60,0.2)",
              fontSize: "0.6rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "#005B96", display: "block" }}>
          {user.title} · {user.department}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.email}
        </Typography>
        {user.expertise && user.expertise.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
            {user.expertise.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ fontSize: "0.58rem", height: 18, bgcolor: "#EFF6FF", color: "#0077B6", fontWeight: 500 }}
              />
            ))}
            {user.expertise.length > 3 && (
              <Chip label={`+${user.expertise.length - 3}`} size="small" sx={{ fontSize: "0.58rem", height: 18, bgcolor: "#F1F5F9", color: "#94A3B8", fontWeight: 500 }} />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

const ALL_DEPTS = ["All", ...departments, "Research Cell", "Administration"];
const ALL_ROLES = ["All", "faculty", "admin"];

export default function AdminUserDirectory({ users }) {
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered = useMemo(() => {
    let result = filterDirectoryUsers(users, query);
    if (deptFilter !== "All") result = result.filter((u) => u.department === deptFilter);
    if (roleFilter !== "All") result = result.filter((u) => u.role === roleFilter);
    return result;
  }, [users, query, deptFilter, roleFilter]);

  const adminUsers = useMemo(() => users.filter((u) => u.role === "admin"), [users]);
  const facultyUsers = useMemo(() => users.filter((u) => u.role === "faculty"), [users]);

  const summaryStats = [
    { label: "Total users", value: users.length, icon: <PeopleAltIcon sx={{ fontSize: 28, color: "#0077B6" }} /> },
    { label: "Faculty", value: facultyUsers.length, icon: <SchoolIcon sx={{ fontSize: 28, color: "#16803C" }} /> },
    { label: "Admins", value: adminUsers.length, icon: <AdminPanelSettingsIcon sx={{ fontSize: 28, color: "#D97706" }} /> },
  ];

  const hasActiveFilter = query || deptFilter !== "All" || roleFilter !== "All";

  return (
    <Box component="section">
      {/* Summary stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryStats.map((s) => (
          <Grid size={{ xs: 12, sm: 4 }}   key={s.label}>
            <Card sx={{ borderRadius: "24px", p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: "14px", bgcolor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.icon}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.25em", color: "text.secondary", fontWeight: 600 }}>
                  {s.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#1F2933", lineHeight: 1.2, mt: 0.25 }}>
                  {s.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search + Filter panel */}
      <Card sx={{ borderRadius: "24px", p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <FilterListIcon sx={{ fontSize: 20, color: "#0B2D4D" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Search &amp; Filter Directory</Typography>
          <Chip
            label={`${filtered.length} of ${users.length} users`}
            size="small"
            sx={{ ml: "auto", bgcolor: "rgba(0,119,182,0.1)", color: "#0077B6", fontWeight: 700 }}
          />
        </Box>

        <TextField
          fullWidth
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, department, title, or expertise..."
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

        {/* Department filter */}
        <Box sx={{ mt: 2.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Department
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
            {ALL_DEPTS.map((dept) => (
              <Chip
                key={dept}
                label={dept}
                size="small"
                onClick={() => setDeptFilter(dept)}
                sx={{
                  cursor: "pointer",
                  fontWeight: deptFilter === dept ? 700 : 500,
                  bgcolor: deptFilter === dept ? "#0B2D4D" : "#F1F5F9",
                  color: deptFilter === dept ? "white" : "#475569",
                  border: "1px solid",
                  borderColor: deptFilter === dept ? "#0B2D4D" : "#D9E2EC",
                  transition: "all 0.15s",
                  "&:hover": { bgcolor: deptFilter === dept ? "#005B96" : "#E2E8F0" },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Role filter */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>Role:</Typography>
          {ALL_ROLES.map((role) => (
            <Chip
              key={role}
              label={role === "All" ? "All roles" : role}
              size="small"
              onClick={() => setRoleFilter(role)}
              sx={{
                cursor: "pointer",
                textTransform: "capitalize",
                fontWeight: roleFilter === role ? 700 : 500,
                bgcolor: roleFilter === role ? "rgba(0,119,182,0.12)" : "transparent",
                color: roleFilter === role ? "#0077B6" : "#64748B",
                border: "1px solid",
                borderColor: roleFilter === role ? "rgba(0,119,182,0.3)" : "#D9E2EC",
                transition: "all 0.15s",
              }}
            />
          ))}
          {hasActiveFilter && (
            <Chip
              label="Clear all"
              size="small"
              onClick={() => { setQuery(""); setDeptFilter("All"); setRoleFilter("All"); }}
              sx={{ ml: "auto", cursor: "pointer", bgcolor: "#FEF3C7", color: "#D97706", border: "1px solid rgba(217,119,6,0.25)", fontWeight: 600 }}
            />
          )}
        </Box>
      </Card>

      {/* Results grid */}
      <Card sx={{ borderRadius: "24px", overflow: "hidden" }}>
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "#F1F5F9", px: 3, py: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {hasActiveFilter ? `Search Results (${filtered.length})` : `All Users (${users.length})`}
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          {filtered.length > 0 ? (
            <Grid container spacing={2}>
              {filtered.map((user) => (
                <Grid size={{ xs: 12, sm: 6, lg: 6 }}    key={user.email}>
                  <UserCard user={user} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                No users match the selected filters.
              </Typography>
              <Chip
                label="Clear all filters"
                size="small"
                onClick={() => { setQuery(""); setDeptFilter("All"); setRoleFilter("All"); }}
                sx={{ mt: 1.5, cursor: "pointer", bgcolor: "#F1F5F9", color: "#475569" }}
              />
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
}
