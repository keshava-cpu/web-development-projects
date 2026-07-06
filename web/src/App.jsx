import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import {
  Navigate,
  Route,
  Routes,
  // UNSAFE_RemixErrorBoundary, (testing)
  matchPath,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  // departments,
  defaultNotifications,
  directoryUsers,
  findDirectoryUser,
  initialRole,
  sampleEntries,
} from "./mockData";
import DashboardListView from "./pages/faculty/DashboardListView";
import CreateEntryView from "./pages/faculty/CreateEntryView";
import EditEntryView from "./pages/faculty/EditEntryView";
import DashboardDetailView from "./pages/faculty/DashboardDetailView";
import AdminRoute from "./routes/AdminRoute";
import FacultyRoute from "./routes/FacultyRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReviewQueue from "./pages/admin/AdminReviewQueue";
import AdminPublications from "./pages/admin/AdminPublications";
import AdminUserDirectory from "./pages/admin/AdminUserDirectory";
import AdminEntryDetail from "./pages/admin/AdminEntryDetail";
import ProfilePage from "./pages/faculty/ProfilePage";
import SetupProfilePage from "./pages/SetupProfilePage";
import LoginPage from "./views/LoginPage";
// type AuthMode = "google" | "manual";
// type Tab = "dashboard" | "messages" | "review";
const statusLabels = {
  draft: "Draft",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved_for_publication: "Approved",
  published: "Published",
  closed: "Closed",
};
const statusClasses = {
  draft: "bg-surface-100 text-brand-900",
  in_review: "bg-brand-600/10 text-brand-700",
  changes_requested: "bg-warning/10 text-warning",
  approved_for_publication: "bg-success/10 text-success",
  published: "bg-brand-500/10 text-brand-500",
  closed: "bg-slate-200 text-slate-700",
};
const emptyEntry = {
  id: "",
  title: "",
  department: "CSE",
  owner: "",
  contributors: [],
  status: "draft",
  summary: "",
  latestFile: "draft.pdf",
  updatedAt: "",
  metrics: {
    messageCount: 0,
    impactPoints: 0,
  },
  versions: [],
  timeline: [],
  messages: [],
  adminNotes: [],
};
function shortId() {
  return Math.random().toString(36).slice(2, 8);
}
function nowStamp() {
  return new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function loadStoredUserProfiles() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem("rnd_user_profiles");
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item) =>
        item && typeof item.email === "string" && typeof item.name === "string",
    );
  } catch {
    return [];
  }
}
function mergeUserProfiles(base, stored) {
  const existingEmails = new Set(base.map((user) => user.email.toLowerCase()));
  return [
    ...base,
    ...stored.filter((profile) => {
      return !existingEmails.has(profile.email.toLowerCase());
    }),
  ];
}
function persistStoredProfiles(profiles) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem("rnd_user_profiles", JSON.stringify(profiles));
  } catch {
    // Ignore storage failures.
  }
}
function getLoginNotificationTitle(email) {
  const storageKey = `rnd_seen_login:${email.toLowerCase()}`;
  try {
    const hasSeenLogin = window.localStorage.getItem(storageKey) === "true";
    if (!hasSeenLogin) {
      window.localStorage.setItem(storageKey, "true");
      return "Welcome for the first time";
    }
  } catch {
    // Ignore storage failures and fall back to a normal welcome.
  }
  return "Welcome back";
}
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState(initialRole);
  const [search, setSearch] = useState("");
  // const [selectedDepartment, setSelectedDepartment] = useState("All");
  // const [selectedStatus, setSelectedStatus] = useState<EntryStatus | "All">(
  //   "All",
  // );
  // const [selectedTab, setSelectedTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState(() =>
    mergeUserProfiles(directoryUsers, loadStoredUserProfiles()),
  );
  const [entries, setEntries] = useState(sampleEntries);
  const [selectedEntryId, setSelectedEntryId] = useState(sampleEntries[0].id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(defaultNotifications);
  // const [queuedNotifications, setQueuedNotifications] = useState<
  //   NotificationItem[]
  // >([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const notificationsPanelRef = useRef(null);
  // const popupRef = useRef<Window | null>(null);
  // const pollRef = useRef<number | null>(null); (trying to remove this...)
  // const signInHandledRef = useRef(false);
  // const [createOpen, setCreateOpen] = useState(false);
  const [entryDraft, setEntryDraft] = useState(emptyEntry);
  // const [messageText, setMessageText] = useState("");
  // const [directMessageText, setDirectMessageText] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const currentUserProfile = useMemo(
    () =>
      users.find(
        (user) => user.email.toLowerCase() === userEmail.toLowerCase(),
      ),
    [userEmail, users],
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [commitMessage, setCommitMessage] = useState("");
  const [selectedVersion, setSelectedVersion] = useState(null);
  const detailMatch = matchPath(
    "/dashboard/entries/:entryId",
    location.pathname,
  );
  const routeEntryId = detailMatch?.params.entryId;
  useEffect(() => {
    /* eslint-disable @eslint-react/exhaustive-deps */
    if (window.location.pathname !== "/auth-callback") checkAuthStatus();
    else {
      const timeoutId = setTimeout(() => {
        setInitializing(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, []);
  useEffect(() => {
    if (authenticated) {
      const controller = new AbortController();
      fetch("/api/publications", {
        credentials: "include",
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.items) {
            setEntries(data.items);
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Error fetching publications:", err);
          }
        });
      return () => controller.abort();
    }
  }, [authenticated]);
  // useEffect(() => {
  //   function handleAuthMessage(event: MessageEvent) {
  //     const data = event.data;
  //     if (!data || data.type !== "oauth-success" || signInHandledRef.current) {
  //       return;
  //     }
  //     const user = data.user;
  //     if (!user?.email) {
  //       return;
  //     }
  //     signInHandledRef.current = true;
  //     if (pollRef.current !== null) {
  //       window.clearInterval(pollRef.current);
  //       pollRef.current = null;
  //     }
  //     handleSuccessfulLogin(user);
  //   }
  //   window.addEventListener("message", handleAuthMessage);
  //   return () => window.removeEventListener("message", handleAuthMessage);
  // }, []);
  const activeEntryId = routeEntryId ?? selectedEntryId;
  const selectedEntry =
    entries.find((entry) => entry.id === activeEntryId) ?? entries[0];
  useEffect(() => {
    if (routeEntryId && routeEntryId !== selectedEntryId) {
      const timeoutId = setTimeout(() => {
        setSelectedEntryId(routeEntryId);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [routeEntryId, selectedEntryId]);
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        !search ||
        [entry.title, entry.owner, entry.department, entry.summary]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [entries, search]);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const userDisplayName = userName || userEmail || "Faculty member";
  const isKnownProfile = Boolean(userEmail && currentUserProfile);
  const facultyOwnedEntries = useMemo(() => {
    return entries.filter((entry) => {
      return (
        entry.owner === userEmail ||
        entry.owner === userDisplayName ||
        entry.contributors.includes(userDisplayName) ||
        entry.contributors.includes(userEmail)
      );
    });
  }, [entries, userDisplayName, userEmail]);
  const facultyProfile = useMemo(() => {
    const activeEntries = facultyOwnedEntries.filter(
      (entry) => entry.status !== "published" && entry.status !== "closed",
    ).length;
    const publishedEntries = facultyOwnedEntries.filter(
      (entry) =>
        entry.status === "published" ||
        entry.status === "approved_for_publication",
    ).length;
    return {
      displayName: userDisplayName,
      email: userEmail,
      role,
      department: facultyOwnedEntries[0]?.department ?? "Research Cell",
      ownedEntries: facultyOwnedEntries,
      activeEntries,
      publishedEntries,
      unreadNotifications: unreadCount,
    };
  }, [facultyOwnedEntries, unreadCount, role, userDisplayName, userEmail]);
  function selectEntry(entryId) {
    setSelectedEntryId(entryId);
    navigate(`/dashboard/entries/${entryId}`);
  }
  const addEntryNotification = useCallback((title, detail) => {
    const item = {
      id: shortId(),
      title,
      detail,
      createdAt: nowStamp(),
      unread: true,
    };
    setNotifications((current) => [item, ...current]);
  }, []);
  const handleSuccessfulLogin = useCallback(
    (user) => {
      const normalizedEmail = user.email.toLowerCase();
      const existingProfile = findDirectoryUser(normalizedEmail, users);
      const shouldRouteToSetup = !existingProfile;
      setAuthenticated(true);
      setUserEmail(normalizedEmail);
      setUserName(user.name || normalizedEmail);
      setRole(user.role || initialRole);
      const title = getLoginNotificationTitle(normalizedEmail);
      const detail = user.name
        ? `${user.name} signed in successfully.`
        : `${normalizedEmail} signed in successfully.`;
      addEntryNotification(title, detail);
      if (shouldRouteToSetup) {
        navigate("/setup-profile", { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    },
    [addEntryNotification, navigate, users],
  );
  function markNotificationRead(id) {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  }
  function markAllNotificationsRead() {
    setNotifications((current) =>
      current.map((n) => ({ ...n, unread: false })),
    );
  }
  function toggleNotifications() {
    setNotificationsOpen((s) => !s);
  }
  // Close notifications on outside click or Escape
  useEffect(() => {
    function handleClick(e) {
      if (!notificationsOpen) return;
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      ) {
        setNotificationsOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") setNotificationsOpen(false);
    }
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [notificationsOpen]);
  // Move focus into the panel when opened for accessibility
  useEffect(() => {
    if (notificationsOpen) {
      // focus after render
      const timeoutId = setTimeout(() => {
        notificationsPanelRef.current?.focus();
      }, 0);
      return clearTimeout(timeoutId);
    }
  }, [notificationsOpen]);
  useEffect(() => {
    if (location.pathname === "/dashboard") {
      const timeoutId = setTimeout(() => {
        setSidebarCollapsed(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname]);
  useEffect(() => {
    if (location.pathname.includes("/edit") && selectedEntry) {
      const timeoutId = setTimeout(() => {
        setEntryDraft(selectedEntry);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, selectedEntry]);
  function checkAuthStatus() {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          console.log("checkAuthStatus res has bad response");
          throw new Error("Not authenticated");
        }
        return res.json();
      })
      .then((data) => {
        if (data.email) {
          const normalizedEmail = data.email.toLowerCase();
          const userRole = data.role || initialRole;
          const knownProfile = users.some(
            (user) => user.email.toLowerCase() === normalizedEmail,
          );
          setAuthenticated(true);
          setUserEmail(normalizedEmail);
          setUserName(data.name || normalizedEmail || "");
          setRole(userRole);
          if (window.location.pathname === "/") {
            if (!knownProfile) {
              navigate("/setup-profile", { replace: true });
            } else if (userRole === "admin") {
              navigate("/admin", { replace: true });
            } else {
              navigate("/dashboard", { replace: true });
            }
          }
        } else {
          console.log("checkAuthStatus false is running....");
          setAuthenticated(false);
        }
      })
      .catch((err) => {
        // Not authenticated
        console.warn("Session restoration omitted:", err.message);
        setAuthenticated(false);
      })
      .finally(() => {
        setInitializing(false);
      });
  }
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/", { replace: true });
      setAuthenticated(false);
      setRole(initialRole);
      setUserEmail("");
      setUserName("");
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  async function handleMockSignIn(email, role, name) {
    try {
      const response = await fetch("/api/auth/mock-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, name }),
      });
      if (response.ok) {
        const user = await response.json();
        handleSuccessfulLogin(user);
      } else {
        addEntryNotification(
          "Sign in failed",
          "Failed to log in with mock account.",
        );
      }
    } catch (error) {
      console.error("Mock sign in error:", error);
    }
  }
  function handleSaveProfile(profile) {
    setUsers((current) => {
      const normalizedEmail = profile.email.toLowerCase();
      const nextUsers = current.some(
        (user) => user.email.toLowerCase() === normalizedEmail,
      )
        ? current.map((user) =>
            user.email.toLowerCase() === normalizedEmail ? profile : user,
          )
        : [...current, profile];
      const extraProfiles = nextUsers.filter(
        (user) =>
          !directoryUsers.some(
            (reference) =>
              reference.email.toLowerCase() === user.email.toLowerCase(),
          ),
      );
      persistStoredProfiles(extraProfiles);
      return nextUsers;
    });
    setUserName(profile.name);
    setRole(profile.role);
    navigate("/dashboard", { replace: true });
  }
  async function handleSignIn() {
    try {
      // Start the OAuth flow via backend which returns a redirect URL
      const response = await fetch("/api/auth/college-oauth/start", {
        credentials: "include",
      });
      const data = await response.json();
      // redirecting to a new tab
      window.location.href = data.url;
    } catch (error) {
      // Showing error + adding notification
      console.error("Sign in error:", error);
      addEntryNotification(
        "Sign in failed",
        "Could not connect to the authentication server.",
      );
    }
  }
  if (initializing) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#FAFCFE",
          gap: 2,
        }}
      >
        <CircularProgress size={32} sx={{ color: "#009688" }} />
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#0B2D4D" }}>
          Loading application session...
        </Typography>
      </Box>
    );
  }
  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#FAFCFE" }}>
      {/* Routes */}
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={
            authenticated ? (
              role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : isKnownProfile ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/setup-profile" replace />
              )
            ) : (
              <LoginPage
                handleSignIn={handleSignIn}
                handleMockSignIn={handleMockSignIn}
                notificationsRef={notificationsRef}
                notificationsOpen={notificationsOpen}
                setNotificationsOpen={setNotificationsOpen}
                unreadCount={unreadCount}
                toggleNotifications={toggleNotifications}
                markAllNotificationsRead={markAllNotificationsRead}
                notifications={notifications}
                markNotificationRead={markNotificationRead}
              />
            )
          }
        />
        <Route
          path="/setup-profile"
          element={
            authenticated ? (
              isKnownProfile ? (
                role === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <SetupProfilePage
                  initialName={userName}
                  initialEmail={userEmail}
                  initialRole={role}
                  onSave={handleSaveProfile}
                />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        {/* Redirect from backend */}
        <Route
          path="/auth-callback"
          element={<AuthCallback onLoginSuccess={handleSuccessfulLogin} />}
        />
        {/* Invalid domain login */}
        <Route path="/invalid-domain" element={<InvalidDomainPage />} />
        {/* Protected routes */}
        <Route
          element={
            authenticated ? (
              isKnownProfile ? (
                <FacultyRoute
                  authenticated={authenticated}
                  role={role}
                  handleLogout={handleLogout}
                  unreadCount={unreadCount}
                  notificationsOpen={notificationsOpen}
                  setNotificationsOpen={setNotificationsOpen}
                  toggleNotifications={toggleNotifications}
                  markAllNotificationsRead={markAllNotificationsRead}
                  notifications={notifications}
                  markNotificationRead={markNotificationRead}
                  notificationsRef={notificationsRef}
                  selectedEntryId={selectedEntryId}
                  facultyProfile={facultyProfile}
                />
              ) : (
                <Navigate to="/setup-profile" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardListView
                search={search}
                setSearch={setSearch}
                filteredEntries={filteredEntries}
                selectEntry={selectEntry}
                statusClasses={statusClasses}
                statusLabels={statusLabels}
              />
            }
          />
          <Route
            path="/dashboard/create"
            element={
              role === "admin" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <CreateEntryView
                  entryDraft={entryDraft}
                  shortId={shortId}
                  nowStamp={nowStamp}
                  userEmail={userEmail}
                  emptyEntry={emptyEntry}
                  setEntries={setEntries}
                  setSelectedEntryId={setSelectedEntryId}
                  setEntryDraft={setEntryDraft}
                  addEntryNotification={addEntryNotification}
                  users={users}
                />
              )
            }
          />
          <Route
            path="/dashboard/entries/:entryId/edit"
            element={
              role === "admin" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <EditEntryView
                  selectedEntry={selectedEntry}
                  selectedEntryId={selectedEntryId}
                  userEmail={userEmail}
                  commitMessage={commitMessage}
                  shortId={shortId}
                  nowStamp={nowStamp}
                  entryDraft={entryDraft}
                  setEntries={setEntries}
                  setCommitMessage={setCommitMessage}
                  addEntryNotification={addEntryNotification}
                  setEntryDraft={setEntryDraft}
                  setSelectedEntryId={setSelectedEntryId}
                  users={users}
                />
              )
            }
          />
          <Route
            path="/dashboard/entries/:entryId"
            element={
              <DashboardDetailView
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                setSearch={setSearch}
                search={search}
                filteredEntries={filteredEntries}
                statusLabels={statusLabels}
                selectedEntry={selectedEntry}
                userEmail={userEmail}
                statusClasses={statusClasses}
                shortId={shortId}
                nowStamp={nowStamp}
                setEntries={setEntries}
                addEntryNotification={addEntryNotification}
                setSelectedVersion={setSelectedVersion}
                selectedVersion={selectedVersion}
                selectedEntryId={selectedEntryId}
                selectEntry={selectEntry}
                isAdmin={isAdmin}
                users={users}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProfilePage
                facultyProfile={facultyProfile}
                users={users}
                entries={entries}
                currentUserEmail={userEmail}
                isAdmin={role === "admin"}
              />
            }
          />
          <Route
            path="/profile/edit"
            element={
              authenticated && isKnownProfile ? (
                role === "admin" ? (
                  <Navigate to="/profile" replace />
                ) : (
                  <SetupProfilePage
                    initialName={currentUserProfile?.name || userName}
                    initialEmail={currentUserProfile?.email || userEmail}
                    initialRole={currentUserProfile?.role || role}
                    initialDepartment={currentUserProfile?.department}
                    initialTitle={currentUserProfile?.title}
                    initialOffice={currentUserProfile?.office}
                    initialExpertise={currentUserProfile?.expertise.join(", ")}
                    initialBio={currentUserProfile?.bio}
                    onSave={handleSaveProfile}
                    isEdit
                  />
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Route>
        <Route
          element={
            authenticated ? (
              isKnownProfile ? (
                <AdminRoute
                  authenticated={authenticated}
                  role={role}
                  handleLogout={handleLogout}
                  unreadCount={unreadCount}
                  notificationsOpen={notificationsOpen}
                  setNotificationsOpen={setNotificationsOpen}
                  toggleNotifications={toggleNotifications}
                  markAllNotificationsRead={markAllNotificationsRead}
                  notifications={notifications}
                  markNotificationRead={markNotificationRead}
                  notificationsRef={notificationsRef}
                />
              ) : (
                <Navigate to="/setup-profile" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route
            path="/admin"
            element={<AdminDashboard entries={entries} users={users} />}
          />
          <Route
            path="/admin/review"
            element={
              <AdminReviewQueue
                entries={entries}
                setEntries={setEntries}
                userEmail={userEmail}
                addEntryNotification={addEntryNotification}
              />
            }
          />
          <Route
            path="/admin/publications"
            element={<AdminPublications entries={entries} />}
          />
          <Route
            path="/admin/entries/:entryId"
            element={
              <AdminEntryDetail
                entries={entries}
                setEntries={setEntries}
                userEmail={userEmail}
                addEntryNotification={addEntryNotification}
              />
            }
          />
          <Route
            path="/admin/users"
            element={<AdminUserDirectory users={users} />}
          />
        </Route>
        <Route
          path="*"
          element={<Navigate to={authenticated ? "/dashboard" : "/"} replace />}
        />
      </Routes>
    </Box>
  );
}
function AuthCallback({ onLoginSuccess }) {
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    const finalizeAndVerify = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tempToken = urlParams.get("token");
        if (!tempToken) {
          throw new Error("No token provided in redirect URL");
        }
        // 1. Instantly strip token from address bar to prevent double-fetch loops
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        // 2. Submit the token to backend via proxy route
        const res = await fetch("/api/auth/finalize-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tempToken }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.email) {
          // 3. Commit user data to parent state
          onLoginSuccess(data);
          return;
        }
        if (res.status === 403 && data.error === "invalid_domain") {
          navigate("/invalid-domain", { replace: true });
          return;
        }
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Error verifying authentication session:", err);
        navigate("/", { replace: true });
      }
    };
    finalizeAndVerify();
  }, [onLoginSuccess, navigate]);
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#FAFCFE",
        gap: 2,
      }}
    >
      <CircularProgress size={32} sx={{ color: "#005B96" }} />
      <Typography variant="body2" sx={{ fontWeight: 500, color: "#0B2D4D" }}>
        Completing secure login...
      </Typography>
    </Box>
  );
}
function InvalidDomainPage() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#F1F5F9",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 448,
          p: 4,
          textAlign: "center",
          borderRadius: "16px",
        }}
      >
        <Box
          sx={{
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: "#fee2e2",
            color: "#b91c1c",
            mb: 2,
          }}
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            style={{ width: 24, height: 24 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Invalid Email Domain
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your organization account is not authorized to access this platform.
          Please log in using an approved institutional email address.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate("/", { replace: true })}
          sx={{
            mt: 3,
            bgcolor: "#0077B6",
            "&:hover": { bgcolor: "#005B96" },
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Back to Login
        </Button>
      </Card>
    </Box>
  );
}
export default App;
