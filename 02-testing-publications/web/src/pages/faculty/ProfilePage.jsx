import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SchoolIcon from "@mui/icons-material/School";
import {
  filterDirectoryUsers,
  findDirectoryUser,
  getDirectoryUserLabel,
  departments,
} from "../../mockData";

const tabLabels = ["Overview", "Publications", "Directory", "Security"];

function statusChipSx(status) {
  if (status === "published") return { bgcolor: "rgba(22,128,60,0.1)", color: "#16803C", border: "1px solid rgba(22,128,60,0.2)" };
  if (status === "approved_for_publication") return { bgcolor: "rgba(0,166,200,0.1)", color: "#0077B6", border: "1px solid rgba(0,166,200,0.2)" };
  if (status === "in_review" || status === "changes_requested") return { bgcolor: "rgba(217,119,6,0.1)", color: "#D97706", border: "1px solid rgba(217,119,6,0.2)" };
  return { bgcolor: "#E2E8F0", color: "#475569", border: "1px solid #CBD5E1" };
}

function formatStatus(status) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function getInitials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "R";
}

export default function ProfilePage({ facultyProfile, users, entries, currentUserEmail, isAdmin = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialDirectoryQuery = queryParams.get("search") || queryParams.get("person") || "";
  const initialViewQuery = queryParams.get("view") || "";
  const initialSection = queryParams.get("section") || queryParams.get("tab") || "";

  const [peopleQuery, setPeopleQuery] = useState(initialDirectoryQuery);
  const [deptFilter, setDeptFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedPersonEmail, setSelectedPersonEmail] = useState(() => {
    const query = initialDirectoryQuery || initialViewQuery;
    const exact =
      findDirectoryUser(query, users) ||
      findDirectoryUser(currentUserEmail, users) ||
      findDirectoryUser(facultyProfile.email, users);
    return exact?.email || currentUserEmail || facultyProfile.email;
  });

  const latestEntry = facultyProfile.ownedEntries[0];
  const visibleEntries = useMemo(() => facultyProfile.ownedEntries, [facultyProfile.ownedEntries]);

  const allDepts = useMemo(() => ["All", ...departments, "Research Cell", "Administration"], []);
  const allRoles = ["All", "faculty", "admin"];

  const filteredUsers = useMemo(() => {
    let result = filterDirectoryUsers(users, peopleQuery);
    if (deptFilter !== "All") result = result.filter((u) => u.department === deptFilter);
    if (roleFilter !== "All") result = result.filter((u) => u.role === roleFilter);
    return result;
  }, [peopleQuery, users, deptFilter, roleFilter]);

  const profileDetails = useMemo(() => {
    return (
      users.find((u) => u.email.toLowerCase() === facultyProfile.email.toLowerCase()) || {
        name: facultyProfile.displayName,
        email: facultyProfile.email,
        role: facultyProfile.role,
        department: facultyProfile.department,
        title: "Researcher",
        office: "Research Cell",
        expertise: [],
        bio: "No biography has been added yet.",
      }
    );
  }, [users, facultyProfile]);

  useEffect(() => {
    const directoryQuery = initialDirectoryQuery || initialViewQuery;
    if (directoryQuery || initialSection === "directory") {
      const id = setTimeout(() => {
        setActiveTab(3); // "Directory" is index 3
        if (directoryQuery) {
          setPeopleQuery(directoryQuery);
          const exactMatch = findDirectoryUser(directoryQuery, users);
          if (exactMatch) setSelectedPersonEmail(exactMatch.email);
        }
      }, 0);
      return () => clearTimeout(id);
    }
  }, [initialDirectoryQuery, initialViewQuery, initialSection, users]);

  const selectedPerson = useMemo(
    () => findDirectoryUser(selectedPersonEmail, users) || findDirectoryUser(currentUserEmail, users) || users[0],
    [currentUserEmail, selectedPersonEmail, users],
  );

  const directoryRef = useRef(null);
  const selectedPersonIsSelf = !!selectedPerson && selectedPerson.email === currentUserEmail;
  const profileAccessRestricted = Boolean(initialViewQuery) && !selectedPersonIsSelf;

  const selectedPersonEntries = useMemo(() => {
    if (!selectedPerson) return [];
    return entries.filter(
      (entry) =>
        entry.owner === selectedPerson.email ||
        entry.owner === selectedPerson.name ||
        entry.contributors.includes(selectedPerson.email) ||
        entry.contributors.includes(selectedPerson.name),
    );
  }, [entries, selectedPerson]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profileDetails.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1500);
    } catch {
      setCopiedEmail(false);
    }
  }

  function handlePeopleQueryChange(nextQuery) {
    setPeopleQuery(nextQuery);
    const nextMatches = filterDirectoryUsers(users, nextQuery);
    if (nextMatches.length === 0) {
      setSelectedPersonEmail(currentUserEmail || facultyProfile.email);
      return;
    }
    const exact = nextMatches.find((user) => {
      const normalized = nextQuery.trim().toLowerCase();
      return user.email.toLowerCase() === normalized || user.name.toLowerCase() === normalized;
    });
    setSelectedPersonEmail((exact || nextMatches[0]).email);
  }

  const summaryStats = [
    { label: "Publications", value: facultyProfile.ownedEntries.length },
    { label: "Active Research", value: facultyProfile.activeEntries },
    { label: "Published Work", value: facultyProfile.publishedEntries },
    { label: "Inbox Notifications", value: facultyProfile.unreadNotifications },
  ];

  return (
    <Box component="section" sx={{ mx: "auto", width: "100%", maxWidth: 1280, px: { xs: 2, sm: 3 }, py: 3 }}>
      <Card sx={{ borderRadius: "32px", overflow: "hidden", boxShadow: "0 10px 30px rgba(11,45,77,0.08)" }}>
        {/* Banner */}
        <Box
          sx={{
            position: "relative",
            background: "linear-gradient(135deg, #0B2D4D 0%, #1F2933 60%, #0f172a 100%)",
            px: { xs: 3, sm: 4 },
            py: { xs: 4, sm: 5 },
            color: "white",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { md: "center" }, gap: 3 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, gap: 2.5 }}>
              <Avatar
                sx={{
                  width: 80, height: 80,
                  bgcolor: "rgba(255,255,255,0.1)",
                  fontSize: "1.5rem", fontWeight: 700,
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                }}
              >
                {getInitials(profileDetails.name)}
              </Avatar>
              <Box>
                <Chip
                  label={profileDetails.title}
                  size="small"
                  sx={{ bgcolor: "rgba(0,166,200,0.2)", color: "#38bdf8", border: "1px solid rgba(0,166,200,0.3)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em" }}
                />
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
                  {profileDetails.name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.75, color: "rgba(255,255,255,0.7)" }}>
                  {profileDetails.department} · {profileDetails.email}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {!isAdmin && currentUserEmail === facultyProfile.email && (
                <Button
                  onClick={() => navigate("/profile/edit")}
                  sx={{ borderRadius: "20px", bgcolor: "white", color: "#0B2D4D", fontWeight: 700, px: 3, py: 1.5, "&:hover": { bgcolor: "#EFF6FF", transform: "scale(1.02)" }, boxShadow: 2, textTransform: "none" }}
                >
                  Edit profile
                </Button>
              )}
              {latestEntry && (
                <Button
                  onClick={() => navigate(`/dashboard/entries/${latestEntry.id}`)}
                  sx={{ borderRadius: "20px", border: "1px solid rgba(255,255,255,0.3)", bgcolor: "rgba(255,255,255,0.1)", color: "white", fontWeight: 500, px: 3, py: 1.5, backdropFilter: "blur(4px)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)", transform: "scale(1.02)" }, textTransform: "none" }}
                >
                  Open latest entry
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ borderBottom: "1px solid #D9E2EC", bgcolor: "#FAFCFE", px: { xs: 2, sm: 4 }, py: 3 }}>
          {summaryStats.map((s) => (
            <Grid item xs={6} lg={3} key={s.label}>
              <Card
                sx={{
                  borderRadius: "16px",
                  p: 2.5,
                  transition: "all 0.2s",
                  "&:hover": { transform: "scale(1.01)", boxShadow: 3 },
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary" }}>
                  {s.label}
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 700, color: "#0B2D4D" }}>
                  {s.value}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ borderBottom: "1px solid #D9E2EC", mb: 3, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, borderRadius: "20px", mx: 0.25, color: "text.secondary", "&.Mui-selected": { color: "white", bgcolor: "#0B2D4D" } }, "& .MuiTabs-indicator": { display: "none" } }}
          >
            {tabLabels.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>

          {/* TAB 0: OVERVIEW */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Stack spacing={3}>
                  <Card sx={{ borderRadius: "16px", p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0B2D4D", borderBottom: "1px solid #F1F5F9", pb: 1.5 }}>
                      Biography
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.75, color: "#374151", whiteSpace: "pre-line" }}>
                      {profileDetails.bio || "No biography details have been added yet. Click 'Edit profile' to share your research focus and background."}
                    </Typography>
                  </Card>
                  <Card sx={{ borderRadius: "16px", p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0B2D4D", borderBottom: "1px solid #F1F5F9", pb: 1.5 }}>
                      Expertise &amp; Focus Areas
                    </Typography>
                    {profileDetails.expertise && profileDetails.expertise.length > 0 ? (
                      <Box sx={{ mt: 2.5, display: "flex", flexWrap: "wrap", gap: 1.25 }}>
                        {profileDetails.expertise.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ bgcolor: "rgba(0,166,200,0.05)", color: "#005B96", border: "1px solid rgba(0,166,200,0.1)", fontWeight: 600, "&:hover": { bgcolor: "rgba(0,166,200,0.1)" } }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No expertise focus areas declared yet.</Typography>
                    )}
                  </Card>
                </Stack>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: "16px", p: 3, bgcolor: "#FAFCFE" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#0B2D4D", borderBottom: "1px solid #D9E2EC", pb: 1.5 }}>
                    Researcher Details
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2.5 }}>
                    {[
                      { label: "Title / Designation", value: profileDetails.title },
                      { label: "Department", value: profileDetails.department },
                      { label: "Office Location", value: profileDetails.office || "Not specified" },
                    ].map(({ label, value }) => (
                      <Box key={label}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary" }}>{label}</Typography>
                        <Typography variant="body1" sx={{ mt: 0.25, fontWeight: 600, color: "#0B2D4D" }}>{value}</Typography>
                      </Box>
                    ))}
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary" }}>System Role</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip label={profileDetails.role} size="small" sx={{ bgcolor: "#E2E8F0", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }} />
                      </Box>
                    </Box>
                    <Box sx={{ borderTop: "1px solid #D9E2EC", pt: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary" }}>Contact Email</Typography>
                      <Box sx={{ mt: 0.75, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, borderRadius: "12px", border: "1px solid #D9E2EC", bgcolor: "white", p: 1.5, boxShadow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "#0B2D4D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {profileDetails.email}
                        </Typography>
                        <IconButton size="small" onClick={copyEmail} title="Copy Email" sx={{ flexShrink: 0, bgcolor: "#F1F5F9", "&:hover": { bgcolor: "#D9E2EC" }, width: 30, height: 30 }}>
                          {copiedEmail ? <CheckIcon sx={{ fontSize: 14, color: "#16803C" }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                        </IconButton>
                      </Box>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* TAB 1: PUBLICATIONS */}
          {activeTab === 1 && (
            <Stack spacing={2}>
              {visibleEntries.length > 0 ? (
                visibleEntries.map((entry) => (
                  <Card
                    key={entry.id}
                    sx={{
                      borderRadius: "16px",
                      p: 2.5,
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { sm: "center" },
                      justifyContent: "space-between",
                      gap: 2,
                      transition: "all 0.2s",
                      "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: "#0B2D4D" }}>{entry.title}</Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mt: 0.75 }}>
                        <Typography variant="caption" color="text.secondary">
                          Department: <Box component="span" sx={{ fontWeight: 600, color: "#005B96" }}>{entry.department}</Box>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">·</Typography>
                        <Typography variant="caption" color="text.secondary">Updated {entry.updatedAt}</Typography>
                        {entry.metrics && (
                          <>
                            <Typography variant="caption" color="text.secondary">·</Typography>
                            <Chip
                              label={`★ ${entry.metrics.impactPoints || 0} Impact Points`}
                              size="small"
                              sx={{ bgcolor: "rgba(0,166,200,0.05)", color: "#0077B6", fontWeight: 600 }}
                            />
                          </>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, alignSelf: { xs: "flex-end", sm: "auto" } }}>
                      <Chip label={formatStatus(entry.status)} size="small" sx={statusChipSx(entry.status)} />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/dashboard/entries/${entry.id}`)}
                        sx={{ borderColor: "#D9E2EC", color: "#0B2D4D", "&:hover": { bgcolor: "#F1F5F9", borderColor: "#93C5FD" }, borderRadius: "20px", textTransform: "none", fontWeight: 600 }}
                      >
                        Open
                      </Button>
                    </Box>
                  </Card>
                ))
              ) : (
                <Box sx={{ borderRadius: "16px", border: "1px dashed #D9E2EC", bgcolor: "#FAFCFE", py: 6, textAlign: "center" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 32, height: 32, color: "#94a3b8", margin: "0 auto" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No publications are linked to this account yet.</Typography>
                </Box>
              )}
            </Stack>
          )}

          {/* TAB 2: DIRECTORY */}
          {activeTab === 3 && (
            <Grid ref={directoryRef} container spacing={3}>
              <Grid item xs={12} lg={6}>
                <Stack spacing={2}>
                  {/* Search + filter panel */}
                  <Card sx={{ borderRadius: "16px", p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                      <SchoolIcon sx={{ fontSize: 22, color: "#0B2D4D" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0B2D4D", lineHeight: 1 }}>Search Faculty and Staff</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Filter by name, email, department, title, or expertise
                        </Typography>
                      </Box>
                      <Chip
                        label={`${filteredUsers.length} result${filteredUsers.length !== 1 ? "s" : ""}`}
                        size="small"
                        sx={{ bgcolor: "rgba(0,119,182,0.1)", color: "#0077B6", fontWeight: 700, ml: "auto" }}
                      />
                    </Box>

                    <TextField
                      fullWidth size="small"
                      value={peopleQuery}
                      onChange={(e) => handlePeopleQueryChange(e.target.value)}
                      placeholder="Search by name, department, expertise..."
                      sx={{ mt: 2, "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "#FAFCFE" } }}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>
                        }
                      }}
                    />

                    {/* Department filter chips */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                        <FilterListIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Department</Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {allDepts.map((dept) => (
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
                              "&:hover": { bgcolor: deptFilter === dept ? "#0077B6" : "#E2E8F0" },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Role filter */}
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Role:</Typography>
                      {allRoles.map((role) => (
                        <Chip
                          key={role}
                          label={role === "All" ? "All roles" : role}
                          size="small"
                          onClick={() => setRoleFilter(role)}
                          sx={{
                            cursor: "pointer",
                            fontWeight: roleFilter === role ? 700 : 500,
                            textTransform: "capitalize",
                            bgcolor: roleFilter === role ? "rgba(0,119,182,0.12)" : "transparent",
                            color: roleFilter === role ? "#0077B6" : "#64748B",
                            border: "1px solid",
                            borderColor: roleFilter === role ? "rgba(0,119,182,0.3)" : "#D9E2EC",
                            transition: "all 0.15s",
                          }}
                        />
                      ))}
                    </Box>
                  </Card>

                  {/* User list */}
                  <Stack spacing={1.25} sx={{ maxHeight: "30rem", overflowY: "auto", pr: 0.5 }} className="thin-scroll">
                    {filteredUsers.map((person) => {
                      const isSelected = person.email === selectedPerson?.email;
                      return (
                        <ButtonBase
                          key={person.id}
                          component="div"
                          onClick={() => setSelectedPersonEmail(person.email)}
                          sx={{
                            width: "100%",
                            textAlign: "left",
                            borderRadius: "14px",
                            border: isSelected ? "2px solid #0077B6" : "1.5px solid #B2C4D8",
                            bgcolor: isSelected ? "rgba(0,119,182,0.04)" : "white",
                            p: 1.75,
                            boxShadow: isSelected
                              ? "0 0 0 3px rgba(0,119,182,0.1), 0 2px 8px rgba(0,119,182,0.1)"
                              : "0 1px 3px rgba(11,45,77,0.07), 0 1px 2px rgba(11,45,77,0.04)",
                            transition: "all 0.15s ease",
                            "&:hover": {
                              borderColor: isSelected ? "#0077B6" : "#6EA8D1",
                              bgcolor: isSelected ? "rgba(0,119,182,0.07)" : "#F5F9FF",
                              boxShadow: isSelected
                                ? "0 0 0 3px rgba(0,119,182,0.14), 0 2px 10px rgba(0,119,182,0.14)"
                                : "0 3px 8px rgba(11,45,77,0.11)",
                              transform: "translateY(-1px)",
                            },
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 0,
                            flexShrink: 0,
                            minHeight: "fit-content",
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          {/* Left accent bar for selected state */}
                          {isSelected && (
                            <Box sx={{
                              position: "absolute",
                              left: 0, top: 0, bottom: 0,
                              width: 4,
                              borderRadius: "14px 0 0 14px",
                              bgcolor: "#0077B6",
                            }} />
                          )}
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, pl: isSelected ? 1.5 : 0, flex: 1, minWidth: 0 }}>
                            <Avatar sx={{
                              width: 46, height: 46,
                              bgcolor: isSelected ? "#0077B6" : "#0B2D4D",
                              fontSize: "0.85rem", fontWeight: 700,
                              flexShrink: 0,
                              borderRadius: "12px",
                              transition: "background 0.15s",
                            }}>
                              {getInitials(person.name)}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: isSelected ? "#0077B6" : "#0B2D4D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {getDirectoryUserLabel(person.email, users)}
                                </Typography>
                                <Chip
                                  label={person.role}
                                  size="small"
                                  sx={{
                                    bgcolor: person.role === "admin" ? "rgba(217,119,6,0.12)" : "rgba(22,128,60,0.1)",
                                    color: person.role === "admin" ? "#D97706" : "#16803C",
                                    border: "1px solid",
                                    borderColor: person.role === "admin" ? "rgba(217,119,6,0.25)" : "rgba(22,128,60,0.2)",
                                    fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: "#005B96", display: "block" }}>
                                {person.title} · {person.department}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {person.email}
                              </Typography>
                              {person.expertise && person.expertise.length > 0 && (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
                                  {person.expertise.slice(0, 3).map((tag) => (
                                    <Chip key={tag} label={tag} size="small" sx={{ fontSize: "0.58rem", height: 18, bgcolor: "#EFF6FF", color: "#0077B6", fontWeight: 500 }} />
                                  ))}
                                  {person.expertise.length > 3 && (
                                    <Chip label={`+${person.expertise.length - 3}`} size="small" sx={{ fontSize: "0.58rem", height: 18, bgcolor: "#F1F5F9", color: "#94A3B8", fontWeight: 500 }} />
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </ButtonBase>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <Box sx={{ borderRadius: "16px", border: "1px dashed #D9E2EC", bgcolor: "#FAFCFE", p: 3, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>No users match the selected filters.</Typography>
                        <Button size="small" onClick={() => { setPeopleQuery(""); setDeptFilter("All"); setRoleFilter("All"); }} sx={{ mt: 1, textTransform: "none", fontSize: "0.75rem" }}>Clear all filters</Button>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} lg={6}>
                {selectedPerson ? (
                  <Card sx={{ borderRadius: "16px", p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: "#0B2D4D", fontSize: "1.25rem", fontWeight: 600, flexShrink: 0, borderRadius: "16px" }}>
                        {getInitials(selectedPerson.name)}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0B2D4D" }}>{selectedPerson.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{selectedPerson.email}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600, color: "#005B96" }}>
                          {selectedPerson.title} · {selectedPerson.department}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Office: {selectedPerson.office || "Not declared"}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2.5, borderTop: "1px solid #F1F5F9", pt: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary" }}>Biography</Typography>
                      <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.65, color: "#374151" }}>
                        {selectedPerson.bio || "This user has not set a biography statement yet."}
                      </Typography>
                    </Box>

                    {selectedPerson.expertise && selectedPerson.expertise.length > 0 && (
                      <Box sx={{ mt: 2.5, borderTop: "1px solid #F1F5F9", pt: 2.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary" }}>Expertise Focus</Typography>
                        <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {selectedPerson.expertise.map((item) => (
                            <Chip key={item} label={item} size="small" sx={{ bgcolor: "#F1F5F9", color: "#475569", border: "1px solid #D9E2EC", fontWeight: 500 }} />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {selectedPersonIsSelf ? (
                      <Box sx={{ mt: 2.5, borderTop: "1px solid #F1F5F9", pt: 2.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary" }}>Your Linked Entries</Typography>
                        <Stack spacing={1} sx={{ mt: 1.5 }}>
                          {selectedPersonEntries.slice(0, 3).map((entry) => (
                            <ButtonBase
                              key={entry.id}
                              onClick={() => navigate(`/dashboard/entries/${entry.id}`)}
                              sx={{ width: "100%", textAlign: "left", borderRadius: "12px", border: "1px solid #D9E2EC", bgcolor: "#FAFCFE", px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, transition: "all 0.15s", "&:hover": { borderColor: "#93C5FD", bgcolor: "#EFF6FF" } }}
                            >
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0B2D4D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {entry.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">{entry.department} · {entry.updatedAt}</Typography>
                              </Box>
                              <Chip label={formatStatus(entry.status)} size="small" sx={{ ...statusChipSx(entry.status), fontSize: "0.6rem", fontWeight: 700 }} />
                            </ButtonBase>
                          ))}
                          {selectedPersonEntries.length === 0 && (
                            <Typography variant="caption" color="text.secondary">No entries linked yet.</Typography>
                          )}
                        </Stack>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 2.5, borderTop: "1px solid #F1F5F9", pt: 2.5 }}>
                        <Box sx={{ borderRadius: "12px", border: "1px solid #D9E2EC", bgcolor: "#F8FAFC", p: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#0B2D4D", textTransform: "uppercase", letterSpacing: "0.1em" }}>Public Summary Only</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, lineHeight: 1.6 }}>
                            {profileAccessRestricted
                              ? "This profile is private. Detailed view history and workflow logs are visible only to the profile owner."
                              : "Further actions and entry management options are restricted to the selected user's account."}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => { setSelectedPersonEmail(currentUserEmail); navigate("/profile"); }}
                            sx={{ mt: 2, bgcolor: "#0B2D4D", color: "white", "&:hover": { bgcolor: "#005B96" }, textTransform: "none", fontWeight: 700, borderRadius: "20px", fontSize: "0.72rem" }}
                          >
                            View your profile
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Card>
                ) : (
                  <Box sx={{ borderRadius: "16px", border: "1px dashed #D9E2EC", bgcolor: "#FAFCFE", py: 8, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">Select a colleague from the list to view their research profile.</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === 3 && activeTab !== 3 && null}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: "16px", p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#0B2D4D" }}>Security &amp; Preferences</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Manage notifications settings and control account destination presets.
                  </Typography>

                  <Stack spacing={1.5} sx={{ mt: 3, borderTop: "1px solid #F1F5F9", pt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "12px", border: "1px solid #D9E2EC", p: 2, bgcolor: "#FAFCFE" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0B2D4D" }}>Email alerts</Typography>
                        <Typography variant="caption" color="text.secondary">Receive immediate status updates for publication queue.</Typography>
                      </Box>
                      <Box
                        component="button"
                        type="button"
                        onClick={() => setEmailAlerts((c) => !c)}
                        aria-pressed={emailAlerts}
                        sx={{
                          position: "relative",
                          display: "inline-flex",
                          height: 24,
                          width: 44,
                          flexShrink: 0,
                          cursor: "pointer",
                          borderRadius: "999px",
                          border: "2px solid transparent",
                          transition: "background-color 0.2s",
                          bgcolor: emailAlerts ? "#16803C" : "#CBD5E1",
                          outline: "none",
                          appearance: "none",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            pointerEvents: "none",
                            display: "inline-block",
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            bgcolor: "white",
                            boxShadow: 1,
                            transition: "transform 0.2s",
                            transform: emailAlerts ? "translateX(20px)" : "translateX(0)",
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "12px", border: "1px solid #D9E2EC", p: 2, bgcolor: "#FAFCFE" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0B2D4D" }}>Session destination</Typography>
                        <Typography variant="caption" color="text.secondary">Default page routing after successfully logging in.</Typography>
                      </Box>
                      <Chip label="Dashboard" size="small" sx={{ bgcolor: "white", border: "1px solid #D9E2EC", color: "#0B2D4D", fontWeight: 700, boxShadow: 1 }} />
                    </Box>
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: "16px", p: 3, bgcolor: "#F8FAFC" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#0B2D4D" }}>Privacy Policy &amp; Access Notes</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    How researcher visibility metadata is shared across VNR VJIET.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 3, lineHeight: 1.75, color: "#374151", borderTop: "1px solid #D9E2EC", pt: 2.5 }}>
                    Your public profile (including title, department, office location, expertise labels, and email address)
                    is queryable by other registered colleagues in the People Directory for publication collab lookups.
                    Workflow timeline comments and entry inspect access remain fully encrypted and accessible only to the
                    assigned contributors and reviewing admin platform roles.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Card>
    </Box>
  );
}
