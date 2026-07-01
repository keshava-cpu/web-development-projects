import { AppUser } from "@/types";
import { useMemo } from "react";

interface AdminUserDirectoryProps {
  users: AppUser[];
}

export default function AdminUserDirectory({ users }: AdminUserDirectoryProps) {
  const adminUsers = useMemo(
    () => users.filter((user) => user.role === "admin"),
    [users],
  );

  const facultyUsers = useMemo(
    () => users.filter((user) => user.role === "faculty"),
    [users],
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold uppercase tracking-[0.3em] text-slate-500">
            Admin accounts
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Review admins, audit roles, and verify who has access to the admin
            workspace.
          </p>
          <div className="mt-4 space-y-3">
            {adminUsers.map((user) => (
              <div
                key={user.email}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {user.title} · {user.department}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold uppercase tracking-[0.3em] text-slate-500">
            Faculty accounts
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Audit user profiles and see which faculty are participating in the
            publication workflow.
          </p>
          <div className="mt-4 space-y-3">
            {facultyUsers.slice(0, 6).map((user) => (
              <div
                key={user.email}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {user.title} · {user.department}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Directory summary
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Total users
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {users.length}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Faculty
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {facultyUsers.length}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Admins
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {adminUsers.length}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
