import { PublicationEntry } from "@/types";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface AdminPublicationsProps {
  entries: PublicationEntry[];
}

function statusDisplay(status: PublicationEntry["status"]) {
  if (status === "in_review") return "In review";
  if (status === "changes_requested") return "Changes requested";
  if (status === "approved_for_publication") return "Approved";
  if (status === "published") return "Published";
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

export default function AdminPublications({ entries }: AdminPublicationsProps) {
  const navigate = useNavigate();

  const totals = useMemo(() => {
    return {
      total: entries.length,
      inReview: entries.filter((entry) => entry.status === "in_review").length,
      approved: entries.filter(
        (entry) => entry.status === "approved_for_publication",
      ).length,
      published: entries.filter((entry) => entry.status === "published").length,
      changesRequested: entries.filter(
        (entry) => entry.status === "changes_requested",
      ).length,
    };
  }, [entries]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Total publications
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totals.total}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            In review
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totals.inReview}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Approved
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totals.approved}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Published
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totals.published}
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            All publications
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            The full publication list is shown here so admins can inspect
            current status across departments.
          </p>
        </div>
        <div className="divide-y divide-slate-200">
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => navigate(`/admin/entries/${entry.id}`)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                  {entry.department}
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {entry.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Owner: {entry.owner}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(entry.status)}`}
                >
                  {statusDisplay(entry.status)}
                </span>
                <span className="text-xs text-slate-500">
                  Updated {entry.updatedAt}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
