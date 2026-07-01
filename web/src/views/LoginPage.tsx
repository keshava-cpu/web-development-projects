import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { NotificationItem } from "@/types";

interface LoginPageProps {
  handleSignIn: () => void;
  handleMockSignIn: (email: string, role: string, name: string) => void;
  notificationsRef: React.RefObject<HTMLDivElement | null>;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  unreadCount: number;
  toggleNotifications: () => void;
  markAllNotificationsRead: () => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
}

export default function LoginPage({
  handleSignIn,
  handleMockSignIn,
  notificationsRef,
  notificationsOpen,
  setNotificationsOpen,
  unreadCount,
  toggleNotifications,
  markAllNotificationsRead,
  notifications,
  markNotificationRead,
}: LoginPageProps) {
  // Local state to manage the Google OAuth redirect lag
  const [isRedirecting, setIsRedirecting] = useState(false);

  const onGoogleClick = () => {
    setIsRedirecting(true);
    handleSignIn();
  };

  return (
    <main className="min-h-screen bg-surface-200 flex items-center justify-center">
      <div className="w-full max-w-sm p-8 text-center rounded-[1.75rem] border border-surface-200 bg-white shadow-soft">
        <div className="relative flex items-center justify-center">
          <h1 className="mb-2 text-2xl font-bold text-brand-950">
            College R&D
          </h1>
          <div className="absolute left-6">
            <div className="relative" ref={notificationsRef}>
              <button
                aria-label={`Notifications (${unreadCount} unread)`}
                aria-haspopup="true"
                aria-expanded={notificationsOpen}
                aria-controls="notifications-panel"
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
          </div>
        </div>
        <p className="mb-6 text-sm text-muted">
          Sign in to access the publications dashboard
        </p>

        {/* UPDATED GOOGLE SIGN IN BUTTON */}
        <button
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-800 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onGoogleClick}
          disabled={isRedirecting}
        >
          {isRedirecting ? (
            <LoadingSpinner size={16} className="text-white" />
          ) : (
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="h-4 w-4 brightness-0 invert"
            />
          )}
          <span>
            {isRedirecting ? "Connecting to Google..." : "Sign in with Google"}
          </span>
        </button>

        <div className="my-6 flex items-center justify-center gap-2">
          <span className="h-px w-full bg-surface-200" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            or
          </span>
          <span className="h-px w-full bg-surface-200" />
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
            Development Mock Sign In
          </p>
          <button
            className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-semibold text-brand-950 hover:bg-surface-100 transition disabled:opacity-50"
            disabled={isRedirecting}
            onClick={() =>
              handleMockSignIn(
                "faculty1@vnrvjiet.in",
                "faculty",
                "Dr. Meera Iyer",
              )
            }
          >
            🔑 Sign in as Dr. Meera Iyer (Faculty)
          </button>
          <button
            className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-semibold text-brand-950 hover:bg-surface-100 transition disabled:opacity-50"
            disabled={isRedirecting}
            onClick={() =>
              handleMockSignIn(
                "faculty2@vnrvjiet.in",
                "faculty",
                "Prof. Ananya Rao",
              )
            }
          >
            🔑 Sign in as Prof. Ananya Rao (Faculty)
          </button>
          <button
            className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-semibold text-brand-950 hover:bg-surface-100 transition disabled:opacity-50"
            disabled={isRedirecting}
            onClick={() =>
              handleMockSignIn("admin1@vnrvjiet.in", "admin", "Admin User")
            }
          >
            🔑 Sign in as Admin User (Admin)
          </button>
        </div>
      </div>
    </main>
  );
}
