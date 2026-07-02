import { Link } from "react-router-dom";
import { AppUser, PublicationEntry } from "@/types";

interface AdminDashboardProps {
  entries: PublicationEntry[];
  users: AppUser[];
}

export default function AdminDashboard({
  entries,
  users,
}: AdminDashboardProps) {
  const totalUsers = users.length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const facultyCount = totalUsers - adminCount;
  const totalPublications = entries.length;
  const reviewCount = entries.filter(
    (entry) => entry.status === "in_review",
  ).length;
  const approvedCount = entries.filter(
    (entry) => entry.status === "approved_for_publication",
  ).length;
  const publishedCount = entries.filter(
    (entry) => entry.status === "published",
  ).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Admin workspace
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">
            Admin dashboard
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Welcome to the admin console. Review submissions, approve
            publications, and audit users from one central place.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              to="review"
              className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-left transition hover:bg-slate-100"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Review queue
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-950">
                {reviewCount} pending items
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Approve, request edits, or publish pending workflows.
              </p>
            </Link>

            <Link
              to="publications"
              className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-left transition hover:bg-slate-100"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Publications
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-950">
                {totalPublications} records
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Browse every submission and inspect status at a glance.
              </p>
            </Link>

            <Link
              to="users"
              className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-left transition hover:bg-slate-100"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                User directory
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-950">
                {facultyCount} faculty + {adminCount} admins
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Verify accounts, roles, and profile details for active users.
              </p>
            </Link>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Admin actions
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-950">
                Centralized oversight
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Admins can approve entries, request revisions, and publish work
                for everyone.
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Approved {approvedCount} entries · Published {publishedCount}{" "}
                entries.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-brand-950 p-6 text-white shadow-soft sm:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
            Admin capabilities
          </p>
          <h2 className="mt-4 text-2xl font-semibold">What admins can do</h2>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-200">
            <li>• Review entries submitted for publication.</li>
            <li>• Approve or request changes for pending submissions.</li>
            <li>• Publish entries once they are approved.</li>
            <li>• Audit faculty and admin user access.</li>
            <li>• Monitor the queue and take action on high-priority items.</li>
          </ul>
          <div className="mt-8 rounded-3xl bg-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
              Quick reference
            </p>
            <p className="mt-3 text-sm text-slate-200">
              Admins are the only role with access to the full review workflow.
              The rest of the app is built around faculty submissions and review
              requests.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
