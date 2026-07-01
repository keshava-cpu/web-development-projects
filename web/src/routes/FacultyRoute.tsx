import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FacultyProfileSummary, NotificationItem } from "@/types";
import ScrollToTop from "../components/ScrollToTop";

interface FacultyRouteProps {
  authenticated: boolean;
  role: string;
  handleLogout: () => Promise<void>;
  unreadCount: number;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  toggleNotifications: () => void;
  markAllNotificationsRead: () => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  notificationsRef: React.RefObject<HTMLDivElement | null>;
  selectedEntryId: string;
  facultyProfile: FacultyProfileSummary;
}

const FacultyRoute: React.FC<FacultyRouteProps> = ({
  authenticated,
  role,
  handleLogout,
  unreadCount,
  notificationsOpen,
  setNotificationsOpen,
  toggleNotifications,
  markAllNotificationsRead,
  notifications,
  notificationsRef,
  selectedEntryId,
  markNotificationRead,
  facultyProfile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [returnToAdmin, setReturnToAdmin] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const profileInitials = useMemo(() => {
    return facultyProfile.displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [facultyProfile.displayName]);

  const isCreatePage = location.pathname === "/dashboard/create";
  const isListPage = location.pathname === "/dashboard";
  const isDetailPage =
    location.pathname.startsWith("/dashboard/entries/") &&
    !location.pathname.endsWith("/edit");
  const showAdminReturnButton =
    role === "admin" &&
    (location.pathname === "/dashboard" ||
      location.pathname.startsWith("/dashboard/") ||
      location.pathname === "/profile" ||
      location.pathname.startsWith("/profile"));
  const adminReturnPath = (returnToAdmin || "/admin") as string;

  const handleDetailViewClick = () => {
    if (selectedEntryId) {
      navigate(`/dashboard/entries/${selectedEntryId}`);
    } else {
      alert("Please select an entry from the list tracking system first!");
    }
  };

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!profileMenuOpen) return;
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    const state = location.state as { returnTo?: string } | null;
    if (state?.returnTo) {
      setReturnToAdmin(state.returnTo);
    }
  }, [location.state]);

  if (!authenticated) return <Navigate to="/" replace />;
  if (role !== "faculty" && role !== "admin")
    return <Navigate to="/error" replace />;

  return (
    <main className="min-h-screen bg-surface-50 flex flex-col">
      <div className="sticky top-0 z-50">
        <header className="border-b border-surface-200 bg-brand-950 text-white shadow-sm">
          <div className="mx-auto flex max-w-full items-center justify-between gap-4 px-5 py-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-left transition hover:opacity-90"
            >
              <p className="text-[10px] uppercase tracking-[0.32em] text-white/60">
                College R&D
              </p>
              <h1 className="text-base font-semibold leading-tight">
                Dashboard
              </h1>
            </button>
            <div className="flex items-center gap-3">
              {showAdminReturnButton && (
                <button
                  type="button"
                  onClick={() => navigate(adminReturnPath)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to admin view
                </button>
              )}
              <div className="relative" ref={notificationsRef}>
                <button
                  aria-label={`Notifications (${unreadCount} unread)`}
                  onClick={toggleNotifications}
                  className="relative rounded-full border border-white/20 bg-transparent p-2 text-sm transition hover:bg-white/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div
                    id="notifications-panel"
                    role="dialog"
                    aria-label="Notifications"
                    className="absolute right-0 z-50 mt-2 w-80 rounded-lg bg-white text-black shadow-lg"
                  >
                    <div className="flex items-center justify-between border-b p-3">
                      <strong>Notifications</strong>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-sm text-muted"
                          onClick={markAllNotificationsRead}
                        >
                          Mark all read
                        </button>
                        <button
                          className="text-sm"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    <ul className="max-h-64 overflow-auto p-2">
                      {notifications.length === 0 && (
                        <li className="p-2 text-sm text-muted">
                          No notifications
                        </li>
                      )}
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          className={`flex items-start gap-2 p-2 ${n.unread ? "bg-surface-50" : ""}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium">
                                {n.title}
                              </div>
                              <div className="text-xs text-muted">
                                {n.createdAt}
                              </div>
                            </div>
                            <div className="mt-1 text-sm text-muted">
                              {n.detail}
                            </div>
                          </div>
                          {n.unread && (
                            <button
                              className="ml-2 text-sm"
                              onClick={() => markNotificationRead(n.id)}
                              aria-label="Mark as read"
                            >
                              Mark
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen((current) => !current)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white transition hover:bg-white/15"
                  aria-label="Open user menu"
                  aria-expanded={profileMenuOpen}
                >
                  {profileInitials || "F"}
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-64 rounded-2xl border border-surface-200 bg-white p-2 text-slate-900 shadow-2xl">
                    <div className="border-b border-surface-200 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                        Account
                      </p>
                      <p className="mt-1 text-sm font-semibold text-brand-950">
                        {facultyProfile.displayName}
                      </p>
                      <p className="text-xs text-muted">
                        {facultyProfile.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                      My profile
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/profile?section=directory");
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m10 0a2 2 0 00-2-2H9a2 2 0 00-2 2m10 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2"
                        />
                      </svg>
                      People directory
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        void handleLogout();
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-surface-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-full items-center gap-2 overflow-x-auto px-4 py-2">
            <button
              onClick={() => navigate("/dashboard")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                isListPage
                  ? "bg-brand-950 text-white"
                  : "bg-surface-100 text-brand-950 hover:bg-surface-200"
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/dashboard/create")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                isCreatePage
                  ? "bg-brand-950 text-white"
                  : "bg-surface-100 text-brand-950 hover:bg-surface-200"
              }`}
            >
              Create Entry
            </button>

            <button
              onClick={handleDetailViewClick}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                isDetailPage
                  ? "bg-brand-950 text-white"
                  : "bg-surface-100 text-brand-950 hover:bg-surface-200"
              }`}
            >
              Detail View
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Outlet />
      </div>

      <ScrollToTop />
    </main>
  );
};

export default FacultyRoute;
