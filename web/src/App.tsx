import { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
  initialRole,
  sampleEntries,
} from "./mockData";
import {
  // ConversationMessage,
  EntryStatus,
  NotificationItem,
  PublicationEntry,
  Role,
  // TimelineEventKind,
} from "./types";
import DashboardListView from "./pages/faculty/DashboardListView";
import CreateEntryView from "./pages/faculty/CreateEntryView";
import EditEntryView from "./pages/faculty/EditEntryView";
import DashboardDetailView from "./pages/faculty/DashboardDetailView";
import AdminRoute from "./routes/AdminRoute";
import FacultyRoute from "./routes/FacultyRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LoginPage from "./views/LoginPage";

// type AuthMode = "google" | "manual";
// type Tab = "dashboard" | "messages" | "review";

const statusLabels: Record<EntryStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved_for_publication: "Approved",
  published: "Published",
  closed: "Closed",
};

const statusClasses: Record<EntryStatus, string> = {
  draft: "bg-surface-100 text-brand-900",
  in_review: "bg-brand-600/10 text-brand-700",
  changes_requested: "bg-warning/10 text-warning",
  approved_for_publication: "bg-success/10 text-success",
  published: "bg-brand-500/10 text-brand-500",
  closed: "bg-slate-200 text-slate-700",
};

const emptyEntry: PublicationEntry = {
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

function getLoginNotificationTitle(email: string) {
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
  const [role, setRole] = useState<Role>(initialRole);
  const [search, setSearch] = useState("");
  // const [selectedDepartment, setSelectedDepartment] = useState("All");
  // const [selectedStatus, setSelectedStatus] = useState<EntryStatus | "All">(
  //   "All",
  // );
  // const [selectedTab, setSelectedTab] = useState<Tab>("dashboard");
  const [entries, setEntries] = useState<PublicationEntry[]>(sampleEntries);
  const [selectedEntryId, setSelectedEntryId] = useState(sampleEntries[0].id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(defaultNotifications);
  // const [queuedNotifications, setQueuedNotifications] = useState<
  //   NotificationItem[]
  // >([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const notificationsPanelRef = useRef<HTMLDivElement | null>(null);
  // const popupRef = useRef<Window | null>(null);
  // const pollRef = useRef<number | null>(null); (trying to remove this...)
  // const signInHandledRef = useRef(false);
  // const [createOpen, setCreateOpen] = useState(false);
  const [entryDraft, setEntryDraft] = useState(emptyEntry);
  // const [messageText, setMessageText] = useState("");
  // const [directMessageText, setDirectMessageText] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [commitMessage, setCommitMessage] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const detailMatch = matchPath(
    "/dashboard/entries/:entryId",
    location.pathname,
  );
  const routeEntryId = detailMatch?.params.entryId;

  useEffect(() => {
    if (window.location.pathname !== "/auth-callback") checkAuthStatus();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetch("/api/publications", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.items) {
            setEntries(data.items);
          }
        })
        .catch((err) => console.error("Error fetching publications:", err));
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
      setSelectedEntryId(routeEntryId);
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
      // const matchesDepartment =
      //   selectedDepartment === "All" || entry.department === selectedDepartment;
      // const matchesStatus =
      //   selectedStatus === "All" || entry.status === selectedStatus;
      return matchesSearch /* matchesDepartment && matchesStatus*/;
    });
  }, [entries, search /*, selectedDepartment, selectedStatus*/]);

  // const departmentStats = useMemo(() => {
  //   return departments.map((department) => {
  //     const deptEntries = entries.filter(
  //       (entry) => entry.department === department,
  //     );
  //     return {
  //       department,
  //       total: deptEntries.length,
  //       published: deptEntries.filter(
  //         (entry) => entry.status === "published" || entry.status === "closed",
  //       ).length,
  //       inReview: deptEntries.filter(
  //         (entry) =>
  //           entry.status === "in_review" ||
  //           entry.status === "changes_requested",
  //       ).length,
  //     };
  //   });
  // }, [entries]);

  // const totals = useMemo(() => {
  //   return {
  //     totalEntries: entries.length,
  //     totalPublished: entries.filter(
  //       (entry) => entry.status === "published" || entry.status === "closed",
  //     ).length,
  //     totalRequests: entries.filter(
  //       (entry) =>
  //         entry.status === "in_review" || entry.status === "changes_requested",
  //     ).length,
  //   };
  // }, [entries]);

  // const visibleMessages = useMemo(() => {
  //   return selectedEntry?.messages ?? [];
  // }, [selectedEntry]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  function selectEntry(entryId: string) {
    setSelectedEntryId(entryId);
    navigate(`/dashboard/entries/${entryId}`);
  }

  const addEntryNotification = useCallback(
    (title: string, detail: string, queue = false) => {
      const item: NotificationItem = {
        id: shortId(),
        title,
        detail,
        createdAt: nowStamp(),
        unread: true,
      };
      if (queue) {
        // setQueuedNotifications((current) => [...current, item]);
        // return;
      }
      setNotifications((current) => [item, ...current]);
    },
    [],
  );

  const handleSuccessfulLogin = useCallback(
    (user: { email: string; name?: string; role?: string }) => {
      setAuthenticated(true);
      setUserEmail(user.email || "");
      setRole((user.role as Role) || initialRole);

      const title = getLoginNotificationTitle(user.email);
      const detail = user.name
        ? `${user.name} signed in successfully.`
        : `${user.email} signed in successfully.`;
      addEntryNotification(title, detail);
    },
    [addEntryNotification],
  );

  // function releaseQueuedNotifications(nextQueue?: NotificationItem[]) {
  //   const queue = nextQueue ?? queuedNotifications;
  //   if (!queue.length) {
  //     return;
  //   }
  //   setNotifications((current) => [...queue, ...current]);
  //   setQueuedNotifications([]);
  // }

  // function updateSelectedEntry(
  //   updater: (entry: PublicationEntry) => PublicationEntry,
  // ) {
  //   setEntries((current) =>
  //     current.map((entry) => {
  //       if (entry.id !== selectedEntryId) {
  //         return entry;
  //       }
  //       return updater(entry);
  //     }),
  //   );
  // }

  function markNotificationRead(id: string) {
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
    function handleClick(e: MouseEvent) {
      if (!notificationsOpen) return;
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
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
      setSidebarCollapsed(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.includes("/edit") && selectedEntry) {
      setEntryDraft(selectedEntry);
    }
  }, [location.pathname, selectedEntry]);

  function checkAuthStatus() {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        if (data.email) {
          setAuthenticated(true);
          setUserEmail(data.email || "");
          setRole((data.role as Role) || initialRole);
          // If on root, navigate to dashboard
          if (window.location.pathname === "/") {
            navigate("/dashboard");
          }
        } else {
          setAuthenticated(false);
        }
      })
      .catch(() => {
        // Not authenticated
        setAuthenticated(false);
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
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async function handleMockSignIn(email: string, role: string, name: string) {
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

  // function handleSaveDraft() {
  //   if (!selectedEntry) {
  //     return;
  //   }
  //   updateSelectedEntry((entry) => ({
  //     ...entry,
  //     summary: entry.summary || "Draft notes updated.",
  //     latestFile: `draft-${entry.versions.length + 1}.pdf`,
  //     updatedAt: nowStamp(),
  //     metrics: {
  //       ...entry.metrics,
  //     },
  //     versions: [
  //       ...entry.versions,
  //       {
  //         id: shortId(),
  //         commitMessage: messageText || "Draft update",
  //         fileName: `draft-${entry.versions.length + 1}.pdf`,
  //         updatedAt: nowStamp(),
  //       },
  //     ],
  //     timeline: [
  //       ...entry.timeline,
  //       {
  //         id: shortId(),
  //         kind: "Edited",
  //         actor: entry.owner,
  //         note: "Uploaded a new draft version.",
  //         at: nowStamp(),
  //       },
  //     ],
  //   }));
  //   addEntryNotification(
  //     "Draft updated",
  //     `${selectedEntry.title} received a new version.`,
  //     true,
  //   );
  //   setMessageText("");
  // }

  // function handleRequestReview() {
  //   if (!selectedEntry) {
  //     return;
  //   }
  //   releaseQueuedNotifications();
  //   updateSelectedEntry((entry) => ({
  //     ...entry,
  //     status: "in_review",
  //     reviewRequestedAt: nowStamp(),
  //     timeline: [
  //       ...entry.timeline,
  //       {
  //         id: shortId(),
  //         kind: "ReviewRequested" as const,
  //         actor: userEmail || "Unknown",
  //         note: "Requested review for the current draft.",
  //         at: nowStamp(),
  //         details: { fromStatus: "draft", toStatus: "in_review" },
  //       },
  //     ],
  //   }));
  //   addEntryNotification("Review requested", `Entry submitted for review.`);
  // }

  // function handleAdminDecision(nextStatus: EntryStatus) {
  //   if (!selectedEntry) {
  //     return;
  //   }
  //   const statusKindMap: Record<EntryStatus, TimelineEventKind> = {
  //     draft: "StatusChanged",
  //     in_review: "ReviewRequested",
  //     changes_requested: "ReviewRejected",
  //     approved_for_publication: "ReviewApproved",
  //     published: "Merged",
  //     closed: "Closed",
  //   };
  //   updateSelectedEntry((entry) => ({
  //     ...entry,
  //     status: nextStatus,
  //     timeline: [
  //       ...entry.timeline,
  //       {
  //         id: shortId(),
  //         kind: statusKindMap[nextStatus],
  //         actor: userEmail || "Admin",
  //         note:
  //           nextStatus === "approved_for_publication"
  //             ? "Approved for publication."
  //             : nextStatus === "published"
  //               ? "Marked as published."
  //               : nextStatus === "changes_requested"
  //                 ? "Changes requested."
  //                 : "Status updated.",
  //         at: nowStamp(),
  //         details: { fromStatus: entry.status, toStatus: nextStatus },
  //       },
  //     ],
  //   }));
  //   addEntryNotification(
  //     "Status updated",
  //     `${selectedEntry.title} changed to ${statusLabels[nextStatus]}.`,
  //   );
  // }

  // function handleSendEntryMessage() {
  //   if (!selectedEntry || !messageText.trim()) {
  //     return;
  //   }

  //   releaseQueuedNotifications();
  //   updateSelectedEntry((entry) => ({
  //     ...entry,
  //     metrics: {
  //       ...entry.metrics,
  //       messageCount: entry.metrics.messageCount + 1,
  //     },
  //     messages: [
  //       ...entry.messages,
  //       {
  //         id: shortId(),
  //         scope: "entry",
  //         author: role === "faculty" ? entry.owner : "Admin Desk",
  //         audience: role === "faculty" ? "Admin" : entry.owner,
  //         text: messageText.trim(),
  //         at: nowStamp(),
  //       },
  //     ],
  //   }));
  //   setMessageText("");
  // }

  // function handleSendDirectMessage() {
  //   if (!selectedEntry || !directMessageText.trim()) {
  //     return;
  //   }

  //   releaseQueuedNotifications();
  //   updateSelectedEntry((entry) => ({
  //     ...entry,
  //     messages: [
  //       ...entry.messages,
  //       {
  //         id: shortId(),
  //         scope: "direct",
  //         author: role === "faculty" ? entry.owner : "Admin Desk",
  //         audience: role === "faculty" ? "Department Head" : entry.owner,
  //         text: directMessageText.trim(),
  //         at: nowStamp(),
  //       },
  //     ],
  //   }));
  //   addEntryNotification(
  //     "Direct message sent",
  //     `A new direct message was posted for ${selectedEntry.title}.`,
  //   );
  //   setDirectMessageText("");
  // }

  // if (location.pathname === "/invalid-domain") {
  //   return (
  //     <Routes>
  //       <Route path="/invalid-domain" element={<InvalidDomainPage />} />
  //     </Routes>
  //   );
  // }

  // if (!authenticated) {
  //   const pathname = window.location.pathname;
  //   if (pathname === "/dashboard") {
  //     return (
  //       <main className="min-h-screen bg-surface-50 flex items-center justify-center">
  //         <div className="w-full max-w-md p-8 text-center rounded-2xl border bg-white">
  //           <h2 className="text-xl font-semibold">Invalid access</h2>
  //           <p className="mt-2 text-sm text-muted">
  //             You must be signed in with Google to view the dashboard.
  //           </p>
  //           <div className="mt-6">
  //             <button
  //               className="rounded-2xl bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
  //               onClick={() => (window.location.href = "/")}
  //             >
  //               Go to sign in
  //             </button>
  //           </div>
  //         </div>
  //       </main>
  //     );
  //   }

  //   return (
  //     <main className="min-h-screen bg-surface-200 flex items-center justify-center">
  //       <div className="w-full max-w-sm p-8 text-center rounded-[1.75rem] border border-surface-200 bg-white shadow-soft">
  //         <div className="relative flex items-center justify-center">
  //           <h1 className="mb-2 text-2xl font-bold text-brand-950">
  //             College R&D
  //           </h1>
  //           <div className="absolute left-6">
  //             <div className="relative" ref={notificationsRef}>
  //               <button
  //                 aria-label={`Notifications (${unreadCount} unread)`}
  //                 aria-haspopup="true"
  //                 aria-expanded={notificationsOpen}
  //                 aria-controls="notifications-panel"
  //                 onClick={toggleNotifications}
  //                 className="relative rounded-full border border-white/20 bg-transparent p-2 text-sm"
  //               >
  //                 <svg
  //                   xmlns="http://www.w3.org/2000/svg"
  //                   className="h-5 w-5"
  //                   fill="none"
  //                   viewBox="0 0 24 24"
  //                   stroke="currentColor"
  //                 >
  //                   <path
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                     strokeWidth={2}
  //                     d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
  //                   />
  //                 </svg>
  //                 {unreadCount > 0 && (
  //                   <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
  //                     {unreadCount}
  //                   </span>
  //                 )}
  //               </button>

  //               {notificationsOpen && (
  //                 <div
  //                   id="notifications-panel"
  //                   role="dialog"
  //                   aria-label="Notifications"
  //                   className="absolute right-0 z-50 mt-2 w-80 rounded-lg bg-white text-black shadow-lg"
  //                 >
  //                   <div className="flex items-center justify-between border-b p-3">
  //                     <strong>Notifications</strong>
  //                     <div className="flex items-center gap-2">
  //                       <button
  //                         className="text-sm text-muted"
  //                         onClick={markAllNotificationsRead}
  //                       >
  //                         Mark all read
  //                       </button>
  //                       <button
  //                         className="text-sm"
  //                         onClick={() => setNotificationsOpen(false)}
  //                       >
  //                         Close
  //                       </button>
  //                     </div>
  //                   </div>
  //                   <ul className="max-h-64 overflow-auto p-2">
  //                     {notifications.length === 0 && (
  //                       <li className="p-2 text-sm text-muted">
  //                         No notifications
  //                       </li>
  //                     )}
  //                     {notifications.map((n) => (
  //                       <li
  //                         key={n.id}
  //                         className={`flex items-start gap-2 p-2 ${n.unread ? "bg-surface-50" : ""}`}
  //                       >
  //                         <div className="flex-1">
  //                           <div className="flex items-center justify-between">
  //                             <div className="text-sm font-medium">
  //                               {n.title}
  //                             </div>
  //                             <div className="text-xs text-muted">
  //                               {n.createdAt}
  //                             </div>
  //                           </div>
  //                           <div className="mt-1 text-sm text-muted">
  //                             {n.detail}
  //                           </div>
  //                         </div>
  //                         {n.unread && (
  //                           <button
  //                             className="ml-2 text-sm"
  //                             onClick={() => markNotificationRead(n.id)}
  //                             aria-label="Mark as read"
  //                           >
  //                             Mark
  //                           </button>
  //                         )}
  //                       </li>
  //                     ))}
  //                   </ul>
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //         <p className="mb-6 text-sm text-muted">
  //           Sign in to access the publications dashboard
  //         </p>

  //         <button
  //           className="w-full rounded-2xl bg-brand-800 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-md transition"
  //           onClick={handleSignIn}
  //         >
  //           Sign in with Google
  //         </button>

  //         <div className="my-6 flex items-center justify-center gap-2">
  //           <span className="h-px w-full bg-surface-200" />
  //           <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
  //             or
  //           </span>
  //           <span className="h-px w-full bg-surface-200" />
  //         </div>

  //         <div className="space-y-3">
  //           <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
  //             Development Mock Sign In
  //           </p>
  //           <button
  //             className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-semibold text-brand-950 hover:bg-surface-100 transition"
  //             onClick={() =>
  //               handleMockSignIn(
  //                 "faculty1@vnrvjiet.in",
  //                 "faculty",
  //                 "Dr. Meera Iyer",
  //               )
  //             }
  //           >
  //             🔑 Sign in as Dr. Meera Iyer (Faculty)
  //           </button>
  //           <button
  //             className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-semibold text-brand-950 hover:bg-surface-100 transition"
  //             onClick={() =>
  //               handleMockSignIn(
  //                 "faculty2@vnrvjiet.in",
  //                 "faculty",
  //                 "Prof. Ananya Rao",
  //               )
  //             }
  //           >
  //             🔑 Sign in as Prof. Ananya Rao (Faculty)
  //           </button>
  //           <button
  //             className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-semibold text-brand-950 hover:bg-surface-100 transition"
  //             onClick={() =>
  //               handleMockSignIn("admin1@vnrvjiet.in", "admin", "Admin User")
  //             }
  //           >
  //             🔑 Sign in as Admin User (Admin)
  //           </button>
  //         </div>
  //       </div>
  //     </main>
  //   );
  // }

  return (
    <main className="min-h-screen bg-surface-50">
      {/* Routes */}
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={
            authenticated ? (
              role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/dashboard" replace />
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
              />
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
              />
            }
          />
          <Route
            path="/dashboard/entries/:entryId/edit"
            element={
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
              />
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
              />
            }
          />
        </Route>
        <Route
          element={
            authenticated ? (
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
              <Navigate to="/" replace />
            )
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to={authenticated ? "/dashboard" : "/"} replace />}
        />
      </Routes>
    </main>
  );
}

// ✅ PLACE THIS OUTSIDE OF THE App() COMPONENT BLOCK
function AuthCallback({
  onLoginSuccess,
}: {
  onLoginSuccess: (user: {
    email: string;
    name?: string;
    role?: string;
  }) => void;
}) {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

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

          // 4. Perform localized execution routing instantly
          if (data.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
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
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-surface-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-800 border-t-transparent"></div>
      <p className="mt-4 text-sm font-medium text-brand-950">
        Completing secure login...
      </p>
    </div>
  );
}

function InvalidDomainPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-100 text-center">
        {/* Warning Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          Invalid Email Domain
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Your organization account is not authorized to access this platform.
          Please log in using an approved institutional email address.
        </p>

        {/* Redirect Button back to Root Login page */}
        <button
          onClick={() => navigate("/", { replace: true })}
          className="mt-6 w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-700/50"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

// function MetricCard({
//   label,
//   value,
//   accent = false,
// }: {
//   label: string;
//   value: number;
//   accent?: boolean;
// }) {
//   return (
//     <div className="mt-3 rounded-3xl border border-surface-200 bg-white p-5 shadow-soft">
//       <p className="text-sm text-muted">{label}</p>
//       <p
//         className={`mt-3 text-3xl font-semibold ${accent ? "text-brand-400" : "text-brand-950"}`}
//       >
//         {value}
//       </p>
//     </div>
//   );
// }

// function InfoCard({
//   label,
//   value,
//   accent = false,
// }: {
//   label: string;
//   value: number;
//   accent?: boolean;
// }) {
//   return (
//     <div className="mt-3 rounded-2xl border border-surface-200 bg-surface-50 p-4">
//       <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
//       <p
//         className={`mt-2 text-2xl font-semibold ${accent ? "text-brand-400" : "text-brand-950"}`}
//       >
//         {value}
//       </p>
//     </div>
//   );
// }

// function InputField({
//   label,
//   value,
//   onChange,
// }: {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
// }) {
//   return (
//     <label className="block mt-3">
//       <span className="text-sm font-medium text-brand-900">{label}</span>
//       <input
//         className="mt-2 w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm outline-none focus:border-brand-700"
//         value={value}
//         onChange={(event) => onChange(event.target.value)}
//       />
//       <p className="mt-2 text-sm text-muted">You typed: {value}</p>
//     </label>
//   );
// }

export default App;
