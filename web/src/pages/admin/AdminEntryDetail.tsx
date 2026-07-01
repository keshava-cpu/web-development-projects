import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PublicationEntry } from "@/types";

interface AdminEntryDetailProps {
  entries: PublicationEntry[];
  setEntries: React.Dispatch<React.SetStateAction<PublicationEntry[]>>;
  userEmail: string;
  addEntryNotification: (title: string, detail: string) => void;
}

function statusDisplay(status: PublicationEntry["status"]) {
  if (status === "in_review") return "In review";
  if (status === "changes_requested") return "Changes requested";
  if (status === "approved_for_publication") return "Approved for publication";
  if (status === "published") return "Published";
  if (status === "draft") return "Draft";
  if (status === "closed") return "Closed";
  return status;
}

function statusStyle(status: PublicationEntry["status"]) {
  if (status === "in_review") return "bg-brand-600/10 text-brand-700";
  if (status === "changes_requested") return "bg-warning/10 text-warning";
  if (status === "approved_for_publication")
    return "bg-success/10 text-success";
  if (status === "published") return "bg-brand-500/10 text-brand-500";
  if (status === "closed") return "bg-slate-200 text-slate-700";
  return "bg-surface-100 text-brand-900";
}

export default function AdminEntryDetail({
  entries,
  setEntries,
  userEmail,
  addEntryNotification,
}: AdminEntryDetailProps) {
  const navigate = useNavigate();
  const { entryId } = useParams<{ entryId: string }>();

  const [loadingStatus, setLoadingStatus] = useState<
    PublicationEntry["status"] | null
  >(null);

  const entry = useMemo(
    () => entries.find((item) => item.id === entryId),
    [entries, entryId],
  );

  if (!entry) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Entry not found</h2>
          <p className="mt-3 text-sm text-slate-600">
            We could not find that entry. Try returning to the admin
            publications list or review queue.
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/publications")}
            className="mt-6 inline-flex rounded-2xl bg-brand-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Back to publications
          </button>
        </div>
      </section>
    );
  }

  async function updateStatus(
    nextStatus: PublicationEntry["status"],
    actionLabel: string,
    timelineNote: string,
  ) {
    if (!entry) return;

    const timelineEvent = {
      id: Math.random().toString(36).slice(2, 8),
      kind: actionLabel,
      actor: userEmail || "Admin",
      at: new Date().toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      note: timelineNote,
      details: {
        fromStatus: entry.status,
        toStatus: nextStatus,
      },
    };

    setLoadingStatus(nextStatus);
    try {
      const response = await fetch(`/api/publications/${entry.id}/status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, timelineEvent }),
      });

      if (!response.ok) {
        throw new Error("Failed to update publication status");
      }

      const { item } = await response.json();
      setEntries((current) =>
        current.map((existing) => (existing.id === item.id ? item : existing)),
      );
      addEntryNotification(`Entry ${statusDisplay(nextStatus)}`, timelineNote);
    } catch (error) {
      console.error(error);
      addEntryNotification(
        "Admin action failed",
        "Unable to update entry status.",
      );
    } finally {
      setLoadingStatus(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Admin entry viewer
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {entry.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Department: {entry.department} · Owner: {entry.owner} · Status:{" "}
            <span className={statusStyle(entry.status)}>
              {statusDisplay(entry.status)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Back to admin dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/publications")}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to publications
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  Summary
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  {entry.title}
                </h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(entry.status)}`}
              >
                {statusDisplay(entry.status)}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {entry.summary || "No summary is available for this entry."}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  Contributors
                </p>
                <p className="mt-2 text-sm text-slate-900">
                  {entry.contributors.length > 0
                    ? entry.contributors.join(", ")
                    : "None assigned"}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  Last update
                </p>
                <p className="mt-2 text-sm text-slate-900">{entry.updatedAt}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Admin workflow
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">
                  Review actions
                </h3>
              </div>
              <span className="text-sm text-slate-500">
                {entry.messages.length} messages
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {(entry.status === "in_review" ||
                entry.status === "changes_requested") && (
                <button
                  type="button"
                  disabled={loadingStatus !== null}
                  onClick={() =>
                    updateStatus(
                      "approved_for_publication",
                      "ReviewApproved",
                      "Approved for publication",
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-sm font-semibold text-success transition hover:bg-success/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingStatus === "approved_for_publication" ? (
                    <>
                      <LoadingSpinner size={16} className="text-success" />
                      Approving...
                    </>
                  ) : (
                    "Approve"
                  )}
                </button>
              )}
              {entry.status === "in_review" && (
                <button
                  type="button"
                  disabled={loadingStatus !== null}
                  onClick={() =>
                    updateStatus(
                      "changes_requested",
                      "ReviewRejected",
                      "Requested changes",
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-warning/10 px-4 py-3 text-sm font-semibold text-warning transition hover:bg-warning/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingStatus === "changes_requested" ? (
                    <>
                      <LoadingSpinner size={16} className="text-warning" />
                      Requesting...
                    </>
                  ) : (
                    "Request changes"
                  )}
                </button>
              )}
              {entry.status === "approved_for_publication" && (
                <button
                  type="button"
                  disabled={loadingStatus !== null}
                  onClick={() =>
                    updateStatus(
                      entry.status === "approved_for_publication"
                        ? "published"
                        : entry.status,
                      "Merged",
                      "Published",
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingStatus === "published" ? (
                    <>
                      <LoadingSpinner size={16} className="text-white" />
                      Publishing...
                    </>
                  ) : (
                    "Publish"
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Timeline</h3>
            <div className="mt-4 space-y-4">
              {entry.timeline.length > 0 ? (
                entry.timeline.map((event) => (
                  <div key={event.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">
                        {event.kind}
                      </p>
                      <span className="text-xs text-slate-500">{event.at}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{event.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">
                  No timeline events have been added yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Quick facts
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Owner:</span> {entry.owner}
              </p>
              <p>
                <span className="font-semibold">Department:</span>{" "}
                {entry.department}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {statusDisplay(entry.status)}
              </p>
              <p>
                <span className="font-semibold">Contributors:</span>{" "}
                {entry.contributors.length}
              </p>
              <p>
                <span className="font-semibold">Versions:</span>{" "}
                {entry.versions.length}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Admin-only controls
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              This view is exclusively for admin auditing and review. You can
              return to the admin dashboard or publications list without leaving
              the admin section.
            </p>
            <button
              type="button"
              onClick={() =>
                navigate(`/dashboard/entries/${entry.id}`, {
                  state: { returnTo: "/admin" },
                })
              }
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Open in user dashboard
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
