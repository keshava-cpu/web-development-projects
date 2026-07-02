import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppUser, PublicationEntry, EntryStatus } from "@/types";
import { getDirectoryUserLabel } from "../../mockData";

interface DashboardDetailViewProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: React.SetStateAction<boolean>) => void;
  setSearch: (value: React.SetStateAction<string>) => void;
  search: string;
  filteredEntries: PublicationEntry[];
  statusLabels: Record<EntryStatus, string>;
  selectedEntry: PublicationEntry;
  userEmail: string;
  statusClasses: Record<EntryStatus, string>;
  shortId: () => void;
  nowStamp: () => void;
  setEntries: (value: React.SetStateAction<PublicationEntry[]>) => void;
  addEntryNotification(title: string, detail: string, queue?: boolean): void;
  setSelectedVersion: (value: React.SetStateAction<string | null>) => void;
  selectedVersion: string | null;
  selectedEntryId: string;
  selectEntry: (entryId: string) => void;
  isAdmin: boolean;
  users: AppUser[];
}

const DashboardDetailView: React.FC<DashboardDetailViewProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  setSearch,
  search,
  filteredEntries,
  statusLabels,
  selectedEntry,
  userEmail,
  statusClasses,
  shortId,
  nowStamp,
  setEntries,
  addEntryNotification,
  setSelectedVersion,
  selectedVersion,
  selectedEntryId,
  selectEntry,
  isAdmin,
  users,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnToAdmin = (location.state as { returnTo?: string } | null)
    ?.returnTo;

  const openProfile = (identifier: string) => {
    navigate(
      `/profile?search=${encodeURIComponent(identifier)}&view=${encodeURIComponent(identifier)}&section=directory`,
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-surface-50 lg:flex-row">
      <div className="flex w-full flex-1 flex-col lg:flex-row">
        {sidebarCollapsed && (
          <div className="border-b border-surface-200 bg-white px-3 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="flex w-full items-center justify-between rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-left text-sm font-semibold text-brand-950 shadow-sm transition hover:bg-white"
            >
              <span>Open entry rail</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}

        <aside
          className={`z-20 bg-white shadow-sm transition-all duration-300 lg:sticky lg:top-[108px] lg:h-[calc(100vh-108px)] ${
            sidebarCollapsed ? "hidden lg:flex lg:w-16" : "flex w-full lg:w-80"
          } flex-col flex-shrink-0`}
          style={{ height: sidebarCollapsed ? "auto" : undefined }}
        >
          <div className="flex items-center justify-between border-b border-surface-200 bg-gradient-to-r from-brand-950 to-brand-900 px-4 py-4 text-white">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                Entry rail
              </p>
              <h3 className="mt-1 text-lg font-semibold">Entries</h3>
            </div>
            <button
              className="rounded-lg border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
              onClick={() => setSidebarCollapsed((current) => !current)}
              aria-label={
                sidebarCollapsed
                  ? "Expand entry sidebar"
                  : "Collapse entry sidebar"
              }
              title={sidebarCollapsed ? "Expand" : "Collapse"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="flex flex-1 flex-col overflow-hidden p-4">
              <div className="rounded-2xl border border-surface-200 bg-white p-0 shadow-sm">
                <label className="block">
                  <span className="sr-only">Search entries</span>
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
                      className="w-full rounded-2xl bg-white py-3 pl-10 pr-4 text-sm font-medium text-brand-950 outline-none placeholder:text-muted transition focus:ring-2 focus:ring-brand-700/30"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search entries..."
                    />
                  </div>
                </label>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-brand-700/10 px-3 py-1.5 text-xs font-semibold text-brand-700">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-700" />
                  {filteredEntries.length} visible
                </span>
              </div>

              <div className="mt-4 min-h-0 flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-surface-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-surface-300 [&::-webkit-scrollbar-thumb:hover]:bg-surface-400">
                {filteredEntries.map((entry) => {
                  const isSelected = entry.id === selectedEntryId;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => selectEntry(entry.id)}
                      className={`group w-full rounded-xl border p-3.5 text-left transition-all duration-200 ease-out ${
                        isSelected
                          ? "border-brand-600 bg-gradient-to-br from-brand-600/12 to-brand-700/8 shadow-md ring-1 ring-brand-600/20"
                          : "border-surface-200 bg-white hover:border-brand-400 hover:shadow-md hover:ring-1 hover:ring-brand-500/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-semibold transition-colors ${isSelected ? "text-brand-900" : "text-brand-950 group-hover:text-brand-700"}`}
                          >
                            {entry.title}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted">
                            {entry.owner}
                          </p>
                        </div>
                        <span
                          className={`inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm ${statusClasses[entry.status]}`}
                        >
                          {statusLabels[entry.status]}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-muted">
                          {entry.department}
                        </p>
                        <span className="inline-flex flex-shrink-0 items-center rounded-full bg-brand-950/5 px-2 py-1 text-[10px] font-medium text-brand-800">
                          {entry.timeline.length}{" "}
                          {entry.timeline.length === 1 ? "update" : "updates"}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {filteredEntries.length === 0 && (
                  <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50/50 p-4 text-center text-sm text-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto h-8 w-8 opacity-20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <p className="mt-2">No entries found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="flex flex-1 flex-col items-center justify-start p-3" />
          )}
        </aside>
        {/* Sidebar */}

        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4">
          <section className="mx-auto max-w-5xl relative">
            {returnToAdmin && isAdmin && (
              <button
                type="button"
                onClick={() => navigate(returnToAdmin)}
                aria-label="Return to admin view"
                title="Return to admin view"
                className="fixed right-3 top-3 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-950 text-white shadow-2xl transition hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-400 sm:right-6 sm:top-6 sm:h-12 sm:w-12"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              </button>
            )}
            <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">
                    Dashboard
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-brand-950">
                    Entry details
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-full border border-surface-200 bg-white px-4 py-2 text-sm font-semibold text-brand-900 shadow-sm transition hover:border-brand-300 hover:bg-surface-50"
                    onClick={() => navigate("/dashboard")}
                  >
                    Back to list
                  </button>
                </div>
              </div>

              <article className="rounded-[1.75rem] border border-surface-200 bg-white p-4 shadow-soft sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-surface-200 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">
                      Selected entry
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-brand-950">
                      {selectedEntry?.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted">
                      {selectedEntry?.owner} · {selectedEntry?.department}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-3">
                      {!isAdmin &&
                        (selectedEntry?.owner === userEmail ||
                          (selectedEntry?.contributors?.includes(userEmail) ??
                            false)) && (
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/entries/${selectedEntryId}/edit`,
                              )
                            }
                            className="rounded-lg border border-surface-200 bg-surface-50 px-4 py-2 text-sm font-semibold text-brand-900 transition hover:bg-surface-100"
                          >
                            ✏️ Edit
                          </button>
                        )}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[selectedEntry?.status ?? "draft"]}`}
                      >
                        {statusLabels[selectedEntry?.status ?? "draft"]}
                      </span>
                    </div>

                    {/* Status Transition Buttons */}
                    {selectedEntry && (
                      <div className="flex gap-2">
                        {selectedEntry.status === "draft" && (
                          <button
                            onClick={async () => {
                              const timelineEvent = {
                                id: shortId(),
                                kind: "ReviewRequested" as const,
                                actor: userEmail || "Unknown",
                                at: nowStamp(),
                                note: "Submitted for review",
                                details: {
                                  fromStatus: "draft" as const,
                                  toStatus: "in_review" as const,
                                },
                              };
                              try {
                                const response = await fetch(
                                  `/api/publications/${selectedEntryId}/status`,
                                  {
                                    method: "POST",
                                    credentials: "include",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      status: "in_review",
                                      timelineEvent,
                                    }),
                                  },
                                );
                                if (!response.ok)
                                  throw new Error("Failed to update status");
                                const result = await response.json();
                                setEntries((current) =>
                                  current.map((entry) =>
                                    entry.id === selectedEntryId
                                      ? result.item
                                      : entry,
                                  ),
                                );
                                addEntryNotification(
                                  "Review requested",
                                  "Entry submitted for review",
                                );
                              } catch (err) {
                                console.error(err);
                                addEntryNotification(
                                  "Error",
                                  "Failed to submit for review",
                                );
                              }
                            }}
                            className="rounded-lg bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-200"
                          >
                            📋 Request Review
                          </button>
                        )}
                        {(selectedEntry.status === "in_review" ||
                          selectedEntry.status === "changes_requested") &&
                          isAdmin && (
                            <>
                              <button
                                onClick={async () => {
                                  const timelineEvent = {
                                    id: shortId(),
                                    kind: "ReviewApproved" as const,
                                    actor: userEmail || "Unknown",
                                    at: nowStamp(),
                                    note: "Approved for publication",
                                    details: {
                                      fromStatus: selectedEntry.status,
                                      toStatus:
                                        "approved_for_publication" as const,
                                    },
                                  };
                                  try {
                                    const response = await fetch(
                                      `/api/publications/${selectedEntryId}/status`,
                                      {
                                        method: "POST",
                                        credentials: "include",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          status: "approved_for_publication",
                                          timelineEvent,
                                        }),
                                      },
                                    );
                                    if (!response.ok)
                                      throw new Error(
                                        "Failed to update status",
                                      );
                                    const result = await response.json();
                                    setEntries((current) =>
                                      current.map((entry) =>
                                        entry.id === selectedEntryId
                                          ? result.item
                                          : entry,
                                      ),
                                    );
                                    addEntryNotification(
                                      "Approved",
                                      "Entry approved for publication",
                                    );
                                  } catch (err) {
                                    console.error(err);
                                    addEntryNotification(
                                      "Error",
                                      "Failed to approve entry",
                                    );
                                  }
                                }}
                                className="rounded-lg bg-success/10 px-3 py-1 text-xs font-semibold text-success transition hover:bg-success/20"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={async () => {
                                  const timelineEvent = {
                                    id: shortId(),
                                    kind: "ReviewRejected" as const,
                                    actor: userEmail || "Unknown",
                                    at: nowStamp(),
                                    note: "Changes requested",
                                    details: {
                                      fromStatus: selectedEntry.status,
                                      toStatus: "changes_requested" as const,
                                    },
                                  };
                                  try {
                                    const response = await fetch(
                                      `/api/publications/${selectedEntryId}/status`,
                                      {
                                        method: "POST",
                                        credentials: "include",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          status: "changes_requested",
                                          timelineEvent,
                                        }),
                                      },
                                    );
                                    if (!response.ok)
                                      throw new Error(
                                        "Failed to update status",
                                      );
                                    const result = await response.json();
                                    setEntries((current) =>
                                      current.map((entry) =>
                                        entry.id === selectedEntryId
                                          ? result.item
                                          : entry,
                                      ),
                                    );
                                    addEntryNotification(
                                      "Changes requested",
                                      "Entry needs revision",
                                    );
                                  } catch (err) {
                                    console.error(err);
                                    addEntryNotification(
                                      "Error",
                                      "Failed to request changes",
                                    );
                                  }
                                }}
                                className="rounded-lg bg-warning/10 px-3 py-1 text-xs font-semibold text-warning transition hover:bg-warning/20"
                              >
                                🔄 Request Changes
                              </button>
                            </>
                          )}
                        {selectedEntry.status === "approved_for_publication" &&
                          isAdmin && (
                            <button
                              onClick={async () => {
                                const timelineEvent = {
                                  id: shortId(),
                                  kind: "Merged" as const,
                                  actor: userEmail || "Unknown",
                                  at: nowStamp(),
                                  note: "Published to main",
                                  details: {
                                    fromStatus:
                                      "approved_for_publication" as const,
                                    toStatus: "published" as const,
                                  },
                                };
                                try {
                                  const response = await fetch(
                                    `/api/publications/${selectedEntryId}/status`,
                                    {
                                      method: "POST",
                                      credentials: "include",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        status: "published",
                                        timelineEvent,
                                      }),
                                    },
                                  );
                                  if (!response.ok)
                                    throw new Error("Failed to update status");
                                  const result = await response.json();
                                  setEntries((current) =>
                                    current.map((entry) =>
                                      entry.id === selectedEntryId
                                        ? result.item
                                        : entry,
                                    ),
                                  );
                                  addEntryNotification(
                                    "Published",
                                    "Entry is now published",
                                  );
                                } catch (err) {
                                  console.error(err);
                                  addEntryNotification(
                                    "Error",
                                    "Failed to publish entry",
                                  );
                                }
                              }}
                              className="rounded-lg bg-success/10 px-3 py-1 text-xs font-semibold text-success transition hover:bg-success/20"
                            >
                              🚀 Publish
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                  <section className="space-y-6">
                    <div className="rounded-2xl border border-surface-200 bg-surface-50 p-5">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                        Summary
                      </h4>
                      <p className="mt-3 text-sm leading-6 text-brand-950">
                        {selectedEntry?.summary ||
                          "No summary available for this entry yet."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-surface-200 bg-white p-5">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                        Activity Timeline
                      </h4>
                      <div className="relative mt-4 pl-2">
                        <div className="pointer-events-none absolute left-[0.9rem] top-1 bottom-1 w-px bg-surface-200" />
                        {(selectedEntry?.timeline ?? []).length === 0 && (
                          <p className="text-sm text-muted">No activity yet.</p>
                        )}
                        <div className="mt-3 space-y-2">
                          {(selectedEntry?.timeline ?? []).map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[4.25rem_1.5rem_minmax(0,1fr)] items-start gap-3 py-2"
                            >
                              <div className="pt-1 text-right text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
                                {item.at}
                              </div>
                              <div className="relative flex items-start justify-center">
                                <span className="mt-1.5 h-4 w-4 rounded-full border-[3px] border-white bg-brand-600 shadow ring-4 ring-brand-600/10" />
                              </div>
                              <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4 shadow-sm transition hover:border-brand-200 hover:bg-white">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className="font-semibold text-brand-950">
                                    {item.kind === "Edited" && "📝"}
                                    {item.kind === "Created" && "✨"}
                                    {item.kind === "ReviewRequested" && "📋"}
                                    {item.kind === "ReviewApproved" && "✅"}
                                    {item.kind === "ReviewRejected" && "❌"}
                                    {item.kind === "Merged" && "🔀"}
                                    {item.kind === "StatusChanged" && "🔄"}
                                    {item.kind === "CommentAdded" && "💬"}
                                    {item.kind === "Closed" && "🔒"}
                                    {item.kind === "Reopened" && "🔓"}{" "}
                                    {item.kind}
                                  </span>
                                  <span className="text-muted">
                                    by {item.actor}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-brand-950">
                                  {item.note}
                                </p>
                                {item.details?.commitHash && (
                                  <div className="mt-3 flex items-center gap-2">
                                    <code className="inline-block rounded bg-white px-2 py-1 text-xs font-mono text-brand-700 ring-1 ring-surface-200">
                                      {item.details.commitHash.slice(0, 7)}
                                    </code>
                                  </div>
                                )}
                                {item.details?.fromStatus &&
                                  item.details?.toStatus && (
                                    <div className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-surface-200">
                                      {
                                        statusLabels[
                                          item.details.fromStatus as EntryStatus
                                        ]
                                      }{" "}
                                      →{" "}
                                      {
                                        statusLabels[
                                          item.details.toStatus as EntryStatus
                                        ]
                                      }
                                    </div>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Version History */}
                    <div className="rounded-2xl border border-surface-200 bg-white p-5">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                        Versions & Commits
                      </h4>
                      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                        {(selectedEntry?.versions ?? []).length === 0 && (
                          <p className="text-sm text-muted">No versions yet.</p>
                        )}
                        {(selectedEntry?.versions ?? [])
                          .slice()
                          .reverse()
                          .map((version) => (
                            <button
                              key={version.id}
                              type="button" // 👈 Explicitly define button type so it doesn't accidentally submit forms
                              onClick={() =>
                                setSelectedVersion(
                                  selectedVersion === version.id
                                    ? null
                                    : version.id,
                                )
                              }
                              // Added "w-full text-left" to make sure it stretches and aligns like your original div did
                              className="w-full text-left cursor-pointer rounded-lg border border-surface-200 p-3 transition hover:bg-surface-50"
                            >
                              <div className="flex items-start gap-3">
                                <code className="text-xs font-mono text-brand-700">
                                  {version.commitHash?.slice(0, 7) || "—"}
                                </code>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-brand-950">
                                    {version.commitMessage}
                                  </p>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                                    <span>{version.updatedAt}</span>
                                    {version.author && (
                                      <span>{version.author}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {selectedVersion === version.id && (
                                <div className="mt-3 border-t border-surface-200 pt-3 text-xs text-muted">
                                  <p>📄 File: {version.fileName}</p>
                                </div>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  </section>

                  <aside className="space-y-6">
                    <div className="rounded-2xl border border-surface-200 bg-white p-5">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                        Collaborators
                      </h4>
                      <div className="mt-4 space-y-2">
                        <button
                          type="button"
                          onClick={() =>
                            openProfile(selectedEntry?.owner ?? "")
                          }
                          className="flex w-full items-center gap-3 rounded-lg bg-surface-50 p-3 text-left transition hover:bg-surface-100"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-200 text-xs font-bold text-brand-700">
                            {getDirectoryUserLabel(
                              selectedEntry?.owner ?? "",
                              users,
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 text-sm">
                            <p className="font-medium text-brand-950">
                              {getDirectoryUserLabel(
                                selectedEntry?.owner ?? "",
                                users,
                              )}
                            </p>
                            <p className="text-xs text-muted">
                              Owner · click to open profile
                            </p>
                          </div>
                        </button>
                        {(selectedEntry?.contributors ?? []).map(
                          (contributor) => (
                            <button
                              key={contributor}
                              type="button"
                              onClick={() => openProfile(contributor)}
                              className="flex w-full items-center gap-3 rounded-lg border border-surface-200 p-3 text-left transition hover:border-brand-200 hover:bg-brand-50"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
                                {getDirectoryUserLabel(contributor, users)
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="flex-1 text-sm">
                                <p className="font-medium text-brand-950">
                                  {getDirectoryUserLabel(contributor, users)}
                                </p>
                                <p className="text-xs text-muted">
                                  Contributor · click to open profile
                                </p>
                              </div>
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </aside>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardDetailView;
