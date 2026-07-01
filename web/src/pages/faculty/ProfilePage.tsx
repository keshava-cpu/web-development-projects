import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppUser, FacultyProfileSummary, PublicationEntry } from "@/types";
import {
  filterDirectoryUsers,
  findDirectoryUser,
  getDirectoryUserLabel,
} from "../../mockData";

interface ProfilePageProps {
  facultyProfile: FacultyProfileSummary;
  users: AppUser[];
  entries: PublicationEntry[];
  currentUserEmail: string;
  currentUserProfile?: AppUser;
  onProfileSave?: (profile: AppUser) => void;
  isAdmin?: boolean;
}

const tabLabels = ["Overview", "Publications", "Security", "Activity"] as const;

function statusTone(status: string) {
  if (status === "published") return "bg-success/10 text-success";
  if (status === "approved_for_publication")
    return "bg-brand-600/10 text-brand-700";
  if (status === "in_review" || status === "changes_requested")
    return "bg-warning/10 text-warning";
  return "bg-surface-100 text-brand-950";
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ProfilePage({
  facultyProfile,
  users,
  entries,
  currentUserEmail,
  isAdmin = false,
}: ProfilePageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] =
    useState<(typeof tabLabels)[number]>("Overview");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const initialDirectoryQuery =
    queryParams.get("search") || queryParams.get("person") || "";
  const initialViewQuery = queryParams.get("view") || "";
  const initialSection =
    queryParams.get("section") || queryParams.get("tab") || "";

  const [peopleQuery, setPeopleQuery] = useState(initialDirectoryQuery);
  const [selectedPersonEmail, setSelectedPersonEmail] = useState(() => {
    const query = initialDirectoryQuery || initialViewQuery;
    const exact =
      findDirectoryUser(query, users) ||
      findDirectoryUser(currentUserEmail, users) ||
      findDirectoryUser(facultyProfile.email, users);

    return exact?.email || currentUserEmail || facultyProfile.email;
  });

  const latestEntry = facultyProfile.ownedEntries[0];

  const visibleEntries = useMemo(
    () => facultyProfile.ownedEntries.slice(0, 5),
    [facultyProfile.ownedEntries],
  );

  const filteredUsers = useMemo(
    () => filterDirectoryUsers(users, peopleQuery),
    [peopleQuery, users],
  );

  useEffect(() => {
    const directoryQuery = initialDirectoryQuery || initialViewQuery;
    if (!directoryQuery) {
      return;
    }

    const exactMatch =
      findDirectoryUser(directoryQuery, users) ||
      findDirectoryUser(currentUserEmail, users) ||
      findDirectoryUser(facultyProfile.email, users);

    setPeopleQuery(directoryQuery);
    setSelectedPersonEmail(
      exactMatch?.email || currentUserEmail || facultyProfile.email,
    );
  }, [
    initialDirectoryQuery,
    initialViewQuery,
    currentUserEmail,
    facultyProfile.email,
    users,
  ]);

  const selectedPerson = useMemo(() => {
    return (
      findDirectoryUser(selectedPersonEmail, users) ||
      findDirectoryUser(currentUserEmail, users) ||
      users[0]
    );
  }, [currentUserEmail, selectedPersonEmail, users]);

  const directoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialSection === "directory") {
      setActiveTab("Overview");
      directoryRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [initialSection]);

  const viewProfileRequest = Boolean(initialViewQuery);
  const selectedPersonIsSelf =
    !!selectedPerson && selectedPerson.email === currentUserEmail;
  const profileAccessRestricted = viewProfileRequest && !selectedPersonIsSelf;

  const selectedPersonEntries = useMemo(() => {
    if (!selectedPerson) return [];

    return entries.filter((entry) => {
      return (
        entry.owner === selectedPerson.email ||
        entry.owner === selectedPerson.name ||
        entry.contributors.includes(selectedPerson.email) ||
        entry.contributors.includes(selectedPerson.name)
      );
    });
  }, [entries, selectedPerson]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(facultyProfile.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1500);
    } catch {
      setCopiedEmail(false);
    }
  }

  function handlePeopleQueryChange(nextQuery: string) {
    setPeopleQuery(nextQuery);

    const nextMatches = filterDirectoryUsers(users, nextQuery);
    if (nextMatches.length === 0) {
      setSelectedPersonEmail(currentUserEmail || facultyProfile.email);
      return;
    }

    const exact = nextMatches.find((user) => {
      const normalized = nextQuery.trim().toLowerCase();
      return (
        user.email.toLowerCase() === normalized ||
        user.name.toLowerCase() === normalized
      );
    });

    setSelectedPersonEmail((exact || nextMatches[0]).email);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-6">
      <div className="overflow-hidden rounded-[2rem] border border-surface-200 bg-white shadow-soft">
        <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-slate-900 px-6 py-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold ring-1 ring-white/15">
                {facultyProfile.displayName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? "")
                  .join("") || "F"}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Faculty profile
                </p>
                <h2 className="mt-1 text-3xl font-semibold">
                  {facultyProfile.displayName}
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  {facultyProfile.email} · {facultyProfile.department}
                </p>
                {!isAdmin && currentUserEmail === facultyProfile.email && (
                  <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 ring-1 ring-white/10">
                    Editable profile — use Edit profile
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyEmail}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/15"
              >
                {copiedEmail ? "Copied" : "Copy email"}
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-950 transition hover:bg-brand-50"
              >
                Go to dashboard
              </button>
              {!isAdmin && currentUserEmail === facultyProfile.email && (
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-brand-950 transition hover:bg-white/15"
                >
                  Edit profile
                </button>
              )}
              {latestEntry && (
                <button
                  onClick={() =>
                    navigate(`/dashboard/entries/${latestEntry.id}`)
                  }
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
                >
                  Open latest entry
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-b border-surface-200 bg-surface-50 px-6 py-5 md:grid-cols-4">
          <div className="rounded-2xl border border-surface-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Owned publications
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-950">
              {facultyProfile.ownedEntries.length}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Active entries
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-950">
              {facultyProfile.activeEntries}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Published
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-950">
              {facultyProfile.publishedEntries}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Unread notifications
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-950">
              {facultyProfile.unreadNotifications}
            </p>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="flex flex-wrap items-center gap-2 rounded-full bg-surface-100 p-1">
            {tabLabels.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-brand-950 text-white shadow-sm"
                    : "text-muted hover:text-brand-950"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Overview" && (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="rounded-2xl border border-surface-200 bg-surface-50 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-muted">
                  Account summary
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Role
                    </p>
                    <p className="mt-1 text-lg font-semibold text-brand-950">
                      {facultyProfile.role}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Department
                    </p>
                    <p className="mt-1 text-lg font-semibold text-brand-950">
                      {facultyProfile.department}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Workload
                    </p>
                    <p className="mt-1 text-lg font-semibold text-brand-950">
                      {facultyProfile.activeEntries} active
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Published research
                    </p>
                    <p className="mt-1 text-lg font-semibold text-brand-950">
                      {facultyProfile.publishedEntries} items
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-surface-200 bg-brand-950 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-white/55">
                  Quick actions
                </p>
                <div className="mt-4 space-y-3">
                  {currentUserEmail === facultyProfile.email && (
                    <button
                      onClick={() => navigate("/profile/edit")}
                      className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-950 transition hover:bg-brand-50"
                    >
                      Edit profile
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/dashboard/create")}
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-950 transition hover:bg-brand-50"
                  >
                    Create new entry
                  </button>
                  <button
                    onClick={copyEmail}
                    className="w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
                  >
                    Copy profile email
                  </button>
                  <button
                    onClick={() => setEmailAlerts((current) => !current)}
                    className="w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
                  >
                    {emailAlerts ? "Disable alerts" : "Enable alerts"}
                  </button>
                </div>

                <div className="mt-5 rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                    Current status
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    {emailAlerts
                      ? "Email notifications are active for your account."
                      : "Email notifications are paused until you turn them back on."}
                  </p>
                </div>
              </div>

              <div
                ref={directoryRef}
                className="mt-6 rounded-2xl border border-surface-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">
                      People directory
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-brand-950">
                      Search faculty and staff
                    </h3>
                  </div>
                  <p className="text-sm text-muted">
                    Find people by name, email, department, or expertise.
                  </p>
                </div>

                <label className="mt-4 block">
                  <span className="sr-only">Search people</span>
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35m1.85-5.4a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      value={peopleQuery}
                      onChange={(event) =>
                        handlePeopleQueryChange(event.target.value)
                      }
                      placeholder="Search people..."
                      className="w-full rounded-2xl border border-surface-200 bg-surface-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                    />
                  </div>
                </label>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {filteredUsers.slice(0, 6).map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => {
                        setSelectedPersonEmail(person.email);
                        setPeopleQuery(person.email);
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${
                        person.email === selectedPerson?.email
                          ? "border-brand-400 bg-brand-50 ring-1 ring-brand-200"
                          : "border-surface-200 bg-surface-50 hover:bg-white"
                      }`}
                    >
                      <p className="text-sm font-semibold text-brand-950">
                        {person.name}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {person.department} · {person.title}
                      </p>
                      <p className="mt-2 text-xs text-muted">{person.email}</p>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-4 text-sm text-muted">
                      No users match that search.
                    </div>
                  )}
                </div>

                {selectedPerson && (
                  <div className="mt-5 rounded-2xl border border-surface-200 bg-surface-50 p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-950 text-base font-semibold text-white">
                        {selectedPerson.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase() ?? "")
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand-950">
                          {selectedPerson.name}
                        </p>
                        <p className="text-xs text-muted">
                          {selectedPerson.email}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted">
                      {selectedPerson.title} · {selectedPerson.department}
                    </p>
                    <p className="mt-2 text-sm text-brand-950">
                      {selectedPerson.office}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedPerson.expertise.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-950 ring-1 ring-surface-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">
                          Linked entries
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-brand-950">
                          {selectedPersonEntries.length}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">
                          Role
                        </p>
                        <p className="mt-1 text-lg font-semibold text-brand-950">
                          {selectedPerson.role}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">
                          Office
                        </p>
                        <p className="mt-1 text-lg font-semibold text-brand-950">
                          {selectedPerson.office}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {selectedPersonIsSelf ? (
                        <button
                          type="button"
                          onClick={() => navigate("/profile")}
                          className="rounded-full bg-brand-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
                        >
                          View my full profile
                        </button>
                      ) : (
                        <span className="text-sm text-muted">
                          Deeper profile details are private and visible only to
                          the selected user.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Publications" && (
            <div className="mt-6 grid gap-3">
              {visibleEntries.length > 0 ? (
                visibleEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <p className="text-base font-semibold text-brand-950">
                        {entry.title}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {entry.department} · Updated {entry.updatedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(entry.status)}`}
                      >
                        {formatStatus(entry.status)}
                      </span>
                      <button
                        onClick={() =>
                          navigate(`/dashboard/entries/${entry.id}`)
                        }
                        className="rounded-full border border-surface-200 px-4 py-2 text-sm font-medium text-brand-950 transition hover:bg-surface-100"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-6 text-sm text-muted">
                  No publications are linked to this account yet.
                </div>
              )}
            </div>
          )}

          {activeTab === "Security" && (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-muted">
                  Security controls
                </p>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => setEmailAlerts((current) => !current)}
                    className="flex w-full items-center justify-between rounded-2xl border border-surface-200 px-4 py-3 text-left text-sm font-medium transition hover:bg-surface-50"
                  >
                    <span>Email alerts</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${emailAlerts ? "bg-success/10 text-success" : "bg-surface-100 text-muted"}`}
                    >
                      {emailAlerts ? "On" : "Off"}
                    </span>
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex w-full items-center justify-between rounded-2xl border border-surface-200 px-4 py-3 text-left text-sm font-medium transition hover:bg-surface-50"
                  >
                    <span>Session destination</span>
                    <span className="text-muted">Dashboard</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-surface-200 bg-surface-50 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-muted">
                  Access notes
                </p>
                <p className="mt-4 text-sm leading-6 text-muted">
                  This profile view surfaces the current faculty identity, entry
                  activity, and quick controls. Logout stays in the header
                  profile menu so this page can focus on account data and
                  directory search.
                </p>
              </div>
            </div>
          )}

          {activeTab === "Activity" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">
                    Recent entries
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-brand-950">
                    Published work and draft activity
                  </h3>
                </div>

                <div className="mt-4 space-y-3">
                  {visibleEntries.length > 0 ? (
                    visibleEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-surface-200 bg-surface-50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-brand-950">
                              {entry.title}
                            </p>
                            <p className="text-xs text-muted">
                              Last updated {entry.updatedAt}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              navigate(`/dashboard/entries/${entry.id}`)
                            }
                            className="rounded-full bg-brand-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-6 text-sm text-muted">
                      There is no recorded activity yet for this account.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">
                      People directory
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-brand-950">
                      Search faculty and staff
                    </h3>
                  </div>
                  <p className="text-sm text-muted">
                    Search by name, email, department, title, or expertise.
                  </p>
                </div>

                <label className="mt-4 block">
                  <span className="sr-only">Search people</span>
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35m1.85-5.4a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      value={peopleQuery}
                      onChange={(event) =>
                        handlePeopleQueryChange(event.target.value)
                      }
                      placeholder="Search users..."
                      className="w-full rounded-2xl border border-surface-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                    />
                  </div>
                </label>

                <div className="mt-4 max-h-[20rem] space-y-2 overflow-y-auto pr-1">
                  {filteredUsers.map((person) => {
                    const isSelected = person.email === selectedPerson?.email;

                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => {
                          setSelectedPersonEmail(person.email);
                          setPeopleQuery(person.email);
                        }}
                        className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-brand-400 bg-brand-50 ring-1 ring-brand-200"
                            : "border-surface-200 bg-surface-50 hover:bg-white"
                        }`}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-950 text-sm font-semibold text-white">
                          {person.name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase() ?? "")
                            .join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-brand-950">
                              {getDirectoryUserLabel(person.email, users)}
                            </p>
                            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted ring-1 ring-surface-200">
                              {person.role}
                            </span>
                          </div>
                          <p className="truncate text-xs text-muted">
                            {person.email}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {person.department} · {person.title}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-6 text-sm text-muted">
                      No users match that search.
                    </div>
                  )}
                </div>

                {selectedPerson && (
                  <div className="mt-4 rounded-[1.25rem] border border-surface-200 bg-surface-50 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">
                      Selected person
                    </p>
                    <div className="mt-3 flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-950 text-base font-semibold text-white">
                        {selectedPerson.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase() ?? "")
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-semibold text-brand-950">
                          {selectedPerson.name}
                        </h4>
                        <p className="text-sm text-muted">
                          {selectedPerson.email}
                        </p>
                        <p className="mt-1 text-sm text-brand-950">
                          {selectedPerson.title} · {selectedPerson.department}
                        </p>
                        <p className="text-sm text-muted">
                          {selectedPerson.office}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-brand-950">
                      {selectedPerson.bio}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedPerson.expertise.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-950 ring-1 ring-surface-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">
                          Related entries
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-brand-950">
                          {selectedPersonEntries.length}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">
                          Role
                        </p>
                        <p className="mt-1 text-lg font-semibold text-brand-950">
                          {selectedPerson.role}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">
                          Office
                        </p>
                        <p className="mt-1 text-lg font-semibold text-brand-950">
                          {selectedPerson.office}
                        </p>
                      </div>
                    </div>

                    {selectedPersonIsSelf ? (
                      <div className="mt-5 space-y-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-muted">
                          Linked entries
                        </p>
                        {selectedPersonEntries.slice(0, 3).map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() =>
                              navigate(`/dashboard/entries/${entry.id}`)
                            }
                            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-surface-200 bg-white px-4 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50"
                          >
                            <div>
                              <p className="text-sm font-semibold text-brand-950">
                                {entry.title}
                              </p>
                              <p className="text-xs text-muted">
                                {entry.department} · {entry.updatedAt}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(entry.status)}`}
                            >
                              {formatStatus(entry.status)}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-surface-200 bg-white p-4 text-sm text-muted shadow-sm">
                        <p className="text-xs uppercase tracking-[0.25em] text-muted">
                          Profile access
                        </p>
                        <p className="mt-3 leading-6">
                          {profileAccessRestricted
                            ? "This profile is private. Only the selected user can view the full details for their own account."
                            : "This is a quick lookup summary only. Deeper access is restricted to the selected user's own profile."}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPersonEmail(currentUserEmail);
                              setPeopleQuery(currentUserEmail);
                              navigate("/profile");
                            }}
                            className="rounded-full bg-brand-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
                          >
                            View your own profile
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
