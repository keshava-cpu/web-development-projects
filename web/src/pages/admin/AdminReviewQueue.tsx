import { useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PublicationEntry } from "@/types";

interface AdminReviewQueueProps {
  entries: PublicationEntry[];
  setEntries: Dispatch<SetStateAction<PublicationEntry[]>>;
  userEmail: string;
  addEntryNotification: (title: string, detail: string) => void;
}

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

function statusDisplay(status: PublicationEntry["status"]) {
  if (status === "in_review") return "In review";
  if (status === "changes_requested") return "Changes requested";
  if (status === "approved_for_publication") return "Approved for publication";
  if (status === "published") return "Published";
  if (status === "draft") return "Draft";
  return status;
}

function statusStyle(status: PublicationEntry["status"]) {
  if (status === "in_review") return "bg-brand-600/10 text-brand-700";
  if (status === "changes_requested") return "bg-warning/10 text-warning";
  if (status === "approved_for_publication")
    return "bg-success/10 text-success";
  if (status === "published") return "bg-brand-500/10 text-brand-500";
  return "bg-surface-100 text-brand-900";
}

export default function AdminReviewQueue({
  entries,
  setEntries,
  userEmail,
  addEntryNotification,
}: AdminReviewQueueProps) {
  const navigate = useNavigate();
  const [loadingEntry, setLoadingEntry] = useState<string | null>(null);

  const reviewEntries = entries.filter((entry) =>
    ["in_review", "changes_requested", "approved_for_publication"].includes(
      entry.status,
    ),
  );

  if (!reviewEntries.length) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Review queue</h2>
          <p className="mt-3 text-sm text-slate-600">
            There are no entries waiting for admin review right now. Once
            faculty submit a publication for review, it will appear here.
          </p>
        </div>
      </section>
    );
  }

  async function handleStatusUpdate(
    entry: PublicationEntry,
    nextStatus: PublicationEntry["status"],
    timelineKind: "ReviewApproved" | "ReviewRejected" | "Merged",
    note: string,
  ) {
    setLoadingEntry(entry.id);

    const timelineEvent = {
      id: shortId(),
      kind: timelineKind,
      actor: userEmail || "Admin",
      at: nowStamp(),
      note,
      details: {
        fromStatus: entry.status,
        toStatus: nextStatus,
      },
    };

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

      const result = await response.json();
      setEntries((current) =>
        current.map((item) => (item.id === entry.id ? result.item : item)),
      );
      addEntryNotification(`Entry ${statusDisplay(nextStatus)}`, note);
    } catch (error) {
      console.error(error);
      addEntryNotification(
        "Admin action failed",
        "Unable to update entry status.",
      );
    } finally {
      setLoadingEntry(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Review queue</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage entries that need admin approval, change requests, or
            publication.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/publications")}
          className="inline-flex items-center justify-center rounded-2xl bg-brand-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          View all publications
        </button>
      </div>

      <div className="space-y-4">
        {reviewEntries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {entry.department}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {entry.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Owner: {entry.owner} · Last updated {entry.updatedAt}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(entry.status)}`}
                >
                  {statusDisplay(entry.status)}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/entries/${entry.id}`)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  View details
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {(entry.status === "in_review" ||
                entry.status === "changes_requested") && (
                <button
                  type="button"
                  disabled={loadingEntry === entry.id}
                  onClick={() =>
                    handleStatusUpdate(
                      entry,
                      "approved_for_publication",
                      "ReviewApproved",
                      "Approved for publication",
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-sm font-semibold text-success transition hover:bg-success/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingEntry === entry.id ? (
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
                  disabled={loadingEntry === entry.id}
                  onClick={() =>
                    handleStatusUpdate(
                      entry,
                      "changes_requested",
                      "ReviewRejected",
                      "Requested changes",
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-warning/10 px-4 py-3 text-sm font-semibold text-warning transition hover:bg-warning/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingEntry === entry.id ? (
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
                  disabled={loadingEntry === entry.id}
                  onClick={() =>
                    handleStatusUpdate(
                      entry,
                      "published",
                      "Merged",
                      "Published",
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingEntry === entry.id ? (
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
        ))}
      </div>
    </section>
  );
}
