import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { NotificationItem } from "@/types";

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
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!authenticated) return <Navigate to="/" replace />;
  if (role !== "faculty") return <Navigate to="/error" replace />;

  // 🚀 PATH SCANNING STATES
  const isCreatePage = location.pathname === "/dashboard/create";
  const isListPage = location.pathname === "/dashboard";

  // Detects if the user is looking at a specific entry profile details path
  const isDetailPage =
    location.pathname.startsWith("/dashboard/entries/") &&
    !location.pathname.endsWith("/edit");

  // 🚀 ACTIVE DETAILED NAVIGATION ROUTER HANDLER
  const handleDetailViewClick = () => {
    if (selectedEntryId) {
      navigate(`/dashboard/entries/${selectedEntryId}`);
    } else {
      // Fallback fallback alert if they click detail view before selecting a row item
      alert("Please select an entry from the list tracking system first!");
    }
  };
  return (
    <main className="min-h-screen bg-surface-50 flex flex-col">
      {/* LAYER 1: CORE GLOBAL HEADER */}
      <header className="border-b border-surface-200 bg-brand-950 text-white z-30">
        <div className="mx-auto flex max-w-full px-6 py-4 items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              College R&D
            </p>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification drop wrapper panel element */}
            <div className="relative" ref={notificationsRef}>
              <button
                aria-label={`Notifications (${unreadCount} unread)`}
                onClick={toggleNotifications}
                className="relative rounded-full border border-white/20 bg-transparent p-2 text-sm"
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
                            <div className="text-sm font-medium">{n.title}</div>
                            <div className="text-xs text-muted">
                              {n.createdAt}
                            </div>
                          </div>
                          <div className="mt-1 text-sm text-muted">
                            {n.detail}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              className="rounded-full border border-white/20 px-4 py-2 text-sm"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* LAYER 2: RESTORED & FULLY OPERATIONAL SUB-NAVIGATION ACTIONS BAR */}
      <nav className="border-b border-surface-200 bg-white shadow-sm z-20">
        <div className="mx-auto max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-lg font-semibold text-brand-950">
                Dashboard
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${isListPage ? "bg-brand-700 text-white" : "bg-surface-100 text-brand-950 hover:bg-surface-200"}`}
                >
                  List View
                </button>

                {/* 🌟 DETAIL VIEW TAB ROUTER HOOKED UP 🌟 */}
                {!isCreatePage && (
                  <button
                    onClick={handleDetailViewClick}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isDetailPage
                        ? "bg-brand-700 text-white"
                        : "bg-surface-100 text-brand-950 hover:bg-surface-200"
                    }`}
                  >
                    Detail View
                  </button>
                )}

                {isCreatePage && (
                  <button className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white">
                    Create Entry
                  </button>
                )}
              </div>
            </div>

            {!isCreatePage && (
              <button
                onClick={() => navigate("/dashboard/create")}
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-brand-800"
              >
                + Create Entry
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* LAYER 3: UNBOUNDED CONTAINER TO RESTORE ORIGINAL WIDTH DIMENSIONS */}
      <div className="w-full flex-1 flex">
        <Outlet />
      </div>
    </main>
  );
};

export default FacultyRoute;
