/**
 * PublicationsContext
 *
 * Extracted from PublicationsApp.jsx to separate state/logic from routing.
 * Holds all publications-feature state, derived data, and handler functions.
 *
 * Consumers: PublicationsApp (routes), FacultyRoute, AdminRoute, and any
 * page/view that needs feature-level state.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, matchPath } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";


// ─── Helpers (module-scoped, not exported) ────────────────────────────────────
export function shortId() {
  return Math.random().toString(36).slice(2, 8);
}

export function nowStamp() {
  return new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const emptyEntry = {
  id: "",
  title: "",
  department: "CSE",
  owner: "",
  contributors: [],
  status: "draft",
  summary: "",
  latestFile: "draft.pdf",
  updatedAt: "",
  metrics: { messageCount: 0, impactPoints: 0 },
  versions: [],
  timeline: [],
  messages: [],
  adminNotes: [],
};

export const statusLabels = {
  draft: "Draft",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved_for_publication: "Approved",
  published: "Published",
  closed: "Closed",
};

export const statusClasses = {
  draft: "bg-surface-100 text-brand-900",
  in_review: "bg-brand-600/10 text-brand-700",
  changes_requested: "bg-warning/10 text-warning",
  approved_for_publication: "bg-success/10 text-success",
  published: "bg-brand-500/10 text-brand-500",
  closed: "bg-slate-200 text-slate-700",
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadStoredUserProfiles() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("rnd_user_profiles");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
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
    ...stored.filter(
      (profile) => !existingEmails.has(profile.email.toLowerCase()),
    ),
  ];
}

function persistStoredProfiles(profiles) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("rnd_user_profiles", JSON.stringify(profiles));
  } catch {
    // Ignore storage failures.
    console.log("Local Storage Issue");
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
    // Ignore
  }
  return "Welcome back";
}

/**
 * Makes an authenticated fetch call using the Bearer token from AuthContext.
 */
export function authFetch(url, token, options = {}) {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Context ──────────────────────────────────────────────────────────────────
const PublicationsContext = createContext(null);

export function PublicationsProvider({ children }) {
  const {
    user: authUser,
    token,
    isAuthenticated,
    logout: authLogout,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userEmail = authUser?.email || "";
  const userName = authUser?.name || authUser?.email || "";
  // TODO: fallback role was initialRole from mockData, using least-privileged default 'Faculty'
  const role = authUser?.role || "Faculty";
  const isAdmin = role === "admin";

  // ── State ────────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(() =>
    mergeUserProfiles([], loadStoredUserProfiles()),
  );
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const notificationsPanelRef = useRef(null);
  const [entryDraft, setEntryDraft] = useState(emptyEntry);
  const [commitMessage, setCommitMessage] = useState("");
  const [selectedVersion, setSelectedVersion] = useState(null);

  const detailMatch = matchPath(
    "/publications-tracker/dashboard/entries/:entryId",
    location.pathname,
  );
  const routeEntryId = detailMatch?.params.entryId;

  // ── Fetch publications from keshava API on mount ────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    setEntriesLoading(true);
    setEntriesError(null);
    authFetch("/api/keshava/publications", token, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setEntries(Array.isArray(data.items) ? data.items : []);
        setEntriesLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setEntriesError("Failed to load publications. Please retry.");
          setEntriesLoading(false);
        }
      });
    return () => controller.abort();
  }, [isAuthenticated, token]);

  // ── Derived state ─────────────────────────────────────────────────────────────
  const currentUserProfile = useMemo(
    () =>
      users.find(
        (user) => user.email.toLowerCase() === userEmail.toLowerCase(),
      ),
    [userEmail, users],
  );

  const isKnownProfile = Boolean(userEmail && currentUserProfile);

  const activeEntryId = routeEntryId ?? selectedEntryId;
  const selectedEntry =
    entries.find((entry) => entry.id === activeEntryId) ?? entries[0];

  useEffect(() => {
    if (routeEntryId && routeEntryId !== selectedEntryId) {
      const timeoutId = setTimeout(() => setSelectedEntryId(routeEntryId), 0);
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

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function selectEntry(entryId) {
    setSelectedEntryId(entryId);
    navigate(`/publications-tracker/dashboard/entries/${entryId}`);
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
      // Check if the user already has a saved profile in the merged users array
      const existingProfile = users.find(
        (u) => u.email.toLowerCase() === normalizedEmail,
      );
      const shouldRouteToSetup = !existingProfile;
      const title = getLoginNotificationTitle(normalizedEmail);
      const detail = user.name
        ? `${user.name} signed in successfully.`
        : `${normalizedEmail} signed in successfully.`;
      addEntryNotification(title, detail);
      if (shouldRouteToSetup) {
        navigate("/publications-tracker/setup-profile", { replace: true });
      } else if (user.role === "admin") {
        navigate("/publications-tracker/admin", { replace: true });
      } else {
        navigate("/publications-tracker/dashboard", { replace: true });
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
    navigate("/publications-tracker/dashboard", { replace: true });
  }

  async function handleLogout() {
    try {
      await authFetch("/api/keshava/auth/logout", token, { method: "POST" });
    } catch {
      // Ignore logout API errors
    }
    authLogout();
    navigate("/login", { replace: true });
  }

  async function handleMockSignIn(email, mockRole, name) {
    try {
      const response = await authFetch("/api/keshava/auth/mock-login", token, {
        method: "POST",
        body: JSON.stringify({ email, role: mockRole, name }),
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

  // ── Notification panel click-outside + keyboard close ────────────────────────
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

  useEffect(() => {
    if (notificationsOpen) {
      const timeoutId = setTimeout(
        () => notificationsPanelRef.current?.focus(),
        0,
      );
      return () => clearTimeout(timeoutId);
    }
  }, [notificationsOpen]);

  // ── Route-driven side effects ─────────────────────────────────────────────────
  useEffect(() => {
    if (location.pathname === "/publications-tracker/dashboard") {
      const timeoutId = setTimeout(() => setSidebarCollapsed(false), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.includes("/edit") && selectedEntry) {
      const timeoutId = setTimeout(() => setEntryDraft(selectedEntry), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, selectedEntry]);

  // ─── Context value ────────────────────────────────────────────────────────────
  const value = {
    // Auth
    isAuthenticated,
    token,
    role,
    isAdmin,
    userEmail,
    userName,
    userDisplayName,

    // Entries state
    entries,
    setEntries,
    entriesLoading,
    entriesError,
    selectedEntryId,
    setSelectedEntryId,
    selectedEntry,
    filteredEntries,
    entryDraft,
    setEntryDraft,
    commitMessage,
    setCommitMessage,
    selectedVersion,
    setSelectedVersion,
    search,
    setSearch,

    // Users/profiles
    users,
    setUsers,
    currentUserProfile,
    isKnownProfile,
    facultyProfile,

    // Notifications
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    notificationsRef,
    notificationsPanelRef,
    unreadCount,

    // Sidebar
    sidebarCollapsed,
    setSidebarCollapsed,

    // Display constants
    statusLabels,
    statusClasses,
    emptyEntry,

    // Handlers
    selectEntry,
    addEntryNotification,
    handleSuccessfulLogin,
    markNotificationRead,
    markAllNotificationsRead,
    toggleNotifications,
    handleSaveProfile,
    handleLogout,
    handleMockSignIn,

    // Pure utility functions (needed by child views as props)
    shortId,
    nowStamp,
  };

  return (
    <PublicationsContext.Provider value={value}>
      {children}
    </PublicationsContext.Provider>
  );
}

export function usePublications() {
  const context = useContext(PublicationsContext);
  if (!context) {
    throw new Error(
      "usePublications must be used inside <PublicationsProvider>",
    );
  }
  return context;
}
