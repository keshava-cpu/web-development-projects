import { ReactElement } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { NotificationItem } from "@/types";

interface AdminRouteProps {
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
}

export default function AdminRoute({
  authenticated,
  role,
  handleLogout,
  unreadCount,
  notificationsOpen,
  setNotificationsOpen,
  toggleNotifications,
  markAllNotificationsRead,
  notifications,
  markNotificationRead,
  notificationsRef,
}: AdminRouteProps): ReactElement {
  // 🚀 SECURITY CHECK LAYER 1: If completely logged out, kick them back to login screen
  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  // 🚀 SECURITY CHECK LAYER 2: If logged in but role isn't admin, lock them out
  if (role !== "admin") {
    return <Navigate to="/error" replace />;
  }

  return (
    <main className="min-h-screen bg-surface-50">
      {/* 🟢 ADMIN NAV: REUSES YOUR EXACT GLOBAL DARK BAR WITH LOGOUT & NOTIFICATIONS */}
      <header className="border-b border-surface-200 bg-brand-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              College R&D
            </p>
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications Panel Trigger */}
            <div className="relative" ref={notificationsRef}>
              <button
                aria-label={`Notifications (${unreadCount} unread)`}
                onClick={toggleNotifications}
                className="relative rounded-full border border-white/20 bg-transparent p-2 text-sm"
              >
                <svg
                  xmlns="http://w3.org"
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

              {/* Notifications Tray Dropdown Panel */}
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
                            <div className="text-sm font-medium">{n.title}</div>
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

            <button
              className="rounded-full border border-white/20 px-4 py-2 text-sm"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-surface-200 bg-brand-950/95 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-6 py-3">
          {[
            { to: "/admin", label: "Dashboard" },
            { to: "/admin/review", label: "Review queue" },
            { to: "/admin/publications", label: "Publications" },
            { to: "/admin/users", label: "User directory" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-brand-950"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* 🔴 ADMIN CHILD OUTPUT CANVAS */}
      <div className="mx-auto max-w-7xl p-6">
        <Outlet />
      </div>
    </main>
  );
}
