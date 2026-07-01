import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppUser, PublicationEntry } from "@/types";
import { departments } from "../../mockData";
import UserMultiSelect from "../../components/UserMultiSelect";

interface EditEntryViewProps {
  selectedEntry: PublicationEntry;
  selectedEntryId: string;
  userEmail: string;
  commitMessage: string;
  shortId: () => string;
  nowStamp: () => string;
  entryDraft: PublicationEntry;
  setEntries: (value: React.SetStateAction<PublicationEntry[]>) => void;
  setCommitMessage: (value: React.SetStateAction<string>) => void;
  addEntryNotification: (
    title: string,
    detail: string,
    queue?: boolean,
  ) => void;
  setEntryDraft: (value: React.SetStateAction<PublicationEntry>) => void;
  setSelectedEntryId: (value: React.SetStateAction<string>) => void;
  users: AppUser[];
}

const EditEntryView: React.FC<EditEntryViewProps> = ({
  selectedEntry,
  selectedEntryId,
  userEmail,
  commitMessage,
  shortId,
  nowStamp,
  entryDraft,
  setEntries,
  setCommitMessage,
  addEntryNotification,
  setEntryDraft,
  setSelectedEntryId,
  users,
}) => {
  const navigate = useNavigate();
  // const location = useLocation();
  useEffect(() => {
    setSelectedEntryId(selectedEntryId);
  }, [selectedEntryId, setSelectedEntryId]);

  console.log(selectedEntry);
  return (
    <div className="w-full flex-1 flex flex-col bg-surface-50 overflow-y-auto">
      {/* 🟢 LAYER 1: CLEAN STANDALONE EDIT CONTEXT TOOLBAR BAR */}
      <nav className="border-b border-surface-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-full px-6 py-4">
          {" "}
          {/* Changed max-w-7xl to max-w-full to fill width */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-brand-600 hover:text-brand-700 font-medium"
              >
                ← Back
              </button>
              <div className="border-l border-surface-200 pl-4">
                <h1 className="text-lg font-semibold text-brand-950">
                  Edit Publication
                </h1>
                <p className="mt-1 text-sm text-muted">{selectedEntry.owner}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/dashboard/entries/${selectedEntryId}`)}
              className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
            >
              ⓧ Discard & View
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-auto">
        {selectedEntry && selectedEntry.owner !== userEmail ? (
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="rounded-xl border-2 border-warning/30 bg-warning/5 p-6">
              <div className="flex items-start gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-warning"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4v2m0 0a9 9 0 11-9-9m9 9a9 9 0 109-9"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-warning">Access Denied</h3>
                  <p className="mt-2 text-sm text-warning/80">
                    Only the entry owner can edit this publication. This entry
                    is owned by <strong>{selectedEntry.owner}</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : selectedEntry ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!commitMessage.trim()) {
                addEntryNotification(
                  "Commit message required",
                  "Please enter a commit message describing your changes.",
                );
                return;
              }
              try {
                const commitHash = shortId();
                const newVersion = {
                  id: shortId(),
                  commitMessage: commitMessage.trim(),
                  fileName: entryDraft.latestFile,
                  updatedAt: nowStamp(),
                  commitHash,
                  author: userEmail || "Unknown",
                };
                const timelineEvent = {
                  id: shortId(),
                  kind: "Edited" as const,
                  actor: userEmail || "Unknown",
                  at: nowStamp(),
                  note: commitMessage.trim(),
                  details: {
                    commitHash,
                  },
                };

                const response = await fetch(
                  `/api/publications/${selectedEntryId}/update`,
                  {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: entryDraft.title,
                      department: entryDraft.department,
                      contributors: entryDraft.contributors,
                      summary: entryDraft.summary,
                      latestFile: entryDraft.latestFile,
                      metrics: entryDraft.metrics,
                      newVersion,
                      timelineEvent,
                    }),
                  },
                );

                if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.message || "Failed to update entry");
                }

                const result = await response.json();
                setEntries((current) =>
                  current.map((entry) =>
                    entry.id === selectedEntryId ? result.item : entry,
                  ),
                );
                setCommitMessage("");
                addEntryNotification(
                  "Changes committed",
                  `Changes saved and committed successfully`,
                );
                navigate(`/dashboard/entries/${selectedEntryId}`);
              } catch (error) {
                addEntryNotification(
                  "Commit failed",
                  error instanceof Error
                    ? error.message
                    : "Failed to commit changes",
                );
              }
            }}
            className="mx-auto w-full max-w-7xl px-6 py-6"
          >
            {/* Changes Section */}
            <div className="mb-6 space-y-6">
              {/* Title Change */}
              {entryDraft.title !== selectedEntry.title && (
                <div className="rounded-xl border border-surface-200 bg-white p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-600"></span>
                    <h3 className="text-sm font-semibold text-brand-950">
                      Title
                    </h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted mb-2">
                        Current
                      </p>
                      <p className="rounded-lg bg-surface-50 p-3 text-sm text-brand-600 line-through">
                        {selectedEntry.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted mb-2">New</p>
                      <p className="rounded-lg bg-brand-50 p-3 text-sm font-medium text-brand-950">
                        {entryDraft.title}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Change */}
              {entryDraft.summary !== selectedEntry.summary && (
                <div className="rounded-xl border border-surface-200 bg-white p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-600"></span>
                    <h3 className="text-sm font-semibold text-brand-950">
                      Summary
                    </h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted mb-2">
                        Current
                      </p>
                      <p className="rounded-lg bg-surface-50 p-3 text-sm text-brand-600 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {selectedEntry.summary}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted mb-2">New</p>
                      <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-950 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {entryDraft.summary}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Changes */}
              <div className="rounded-xl border border-surface-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold text-brand-950">
                  Other Changes
                </h3>
                <div className="space-y-3">
                  {entryDraft.department !== selectedEntry.department && (
                    <div className="flex items-center justify-between border-b border-surface-100 pb-3 last:border-0">
                      <span className="text-sm text-muted">Department</span>
                      <span className="text-sm">
                        <span className="line-through text-brand-600">
                          {selectedEntry.department}
                        </span>
                        <span className="mx-2">→</span>
                        <span className="font-medium text-brand-950">
                          {entryDraft.department}
                        </span>
                      </span>
                    </div>
                  )}
                  {entryDraft.latestFile !== selectedEntry.latestFile && (
                    <div className="flex items-center justify-between border-b border-surface-100 pb-3 last:border-0">
                      <span className="text-sm text-muted">File</span>
                      <span className="text-sm">
                        <span className="line-through text-brand-600">
                          {selectedEntry.latestFile}
                        </span>
                        <span className="mx-2">→</span>
                        <span className="font-medium text-brand-950">
                          {entryDraft.latestFile}
                        </span>
                      </span>
                    </div>
                  )}
                  {JSON.stringify(entryDraft.metrics) !==
                    JSON.stringify(selectedEntry.metrics) && (
                    <div className="flex items-center justify-between border-b border-surface-100 pb-3 last:border-0">
                      <span className="text-sm text-muted">Metrics</span>
                      <span className="text-xs text-brand-600">Updated</span>
                    </div>
                  )}
                  {JSON.stringify(entryDraft.contributors) !==
                    JSON.stringify(selectedEntry.contributors) && (
                    <div className="flex items-center justify-between border-b border-surface-100 pb-3 last:border-0">
                      <span className="text-sm text-muted">Contributors</span>
                      <span className="text-xs text-brand-600">
                        {entryDraft.contributors.length} members
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Section */}
            <div className="mb-6 rounded-xl border border-surface-200 bg-white p-6">
              <h2 className="mb-6 text-lg font-semibold text-brand-950">
                📝 Edit Details
              </h2>

              <div className="space-y-6">
                {/* Title */}
                <label className="block">
                  <span className="text-sm font-medium text-brand-950">
                    Title
                  </span>
                  <input
                    type="text"
                    required
                    value={entryDraft.title}
                    onChange={(e) =>
                      setEntryDraft((current) => ({
                        ...current,
                        title: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                  />
                </label>

                {/* Department & File */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-brand-950">
                      Department
                    </span>
                    <select
                      required
                      value={entryDraft.department}
                      onChange={(e) =>
                        setEntryDraft((current) => ({
                          ...current,
                          department: e.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-brand-950">
                      Latest File
                    </span>
                    <input
                      type="text"
                      value={entryDraft.latestFile}
                      onChange={(e) =>
                        setEntryDraft((current) => ({
                          ...current,
                          latestFile: e.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                      placeholder="e.g., research-v2.pdf"
                    />
                  </label>
                </div>

                {/* Summary */}
                <label className="block">
                  <span className="text-sm font-medium text-brand-950">
                    Summary
                  </span>
                  <textarea
                    required
                    value={entryDraft.summary}
                    onChange={(e) =>
                      setEntryDraft((current) => ({
                        ...current,
                        summary: e.target.value,
                      }))
                    }
                    rows={5}
                    className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                  />
                </label>

                {/* Contributors */}
                <UserMultiSelect
                  users={users}
                  selected={entryDraft.contributors}
                  onChange={(contributors) =>
                    setEntryDraft((current) => ({
                      ...current,
                      contributors,
                    }))
                  }
                  label="Contributors"
                  placeholder="Search by name, email, department, or expertise"
                />
                {/* Metrics */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-brand-950">
                      Impact Points
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={entryDraft.metrics.impactPoints}
                      onChange={(e) =>
                        setEntryDraft((current) => ({
                          ...current,
                          metrics: {
                            ...current.metrics,
                            impactPoints: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-brand-950">
                      Message Count
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={entryDraft.metrics.messageCount}
                      onChange={(e) =>
                        setEntryDraft((current) => ({
                          ...current,
                          metrics: {
                            ...current.metrics,
                            messageCount: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Commit Section */}
            <div className="mb-6 rounded-xl border-2 border-brand-200 bg-brand-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-brand-950">
                💾 Commit Changes
              </h2>
              <p className="mb-4 text-sm text-muted">
                Describe what you changed and why.
              </p>
              <label className="block">
                <span>Commit Message</span>
                <textarea
                  required
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g., Updated methodology with latest experimental data from Q2 2026"
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                />
              </label>
              <p className="mt-2 text-xs text-muted">
                Commits to: <strong>main</strong>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 border-t border-surface-200 pt-6">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-800 active:shadow-sm"
              >
                💾 Commit & Save
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(`/dashboard/entries/${selectedEntryId}`)
                }
                className="rounded-xl border border-surface-200 bg-surface-50 px-6 py-3 text-sm font-semibold text-brand-950 transition hover:bg-surface-100"
              >
                Discard
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
};

export default EditEntryView;
