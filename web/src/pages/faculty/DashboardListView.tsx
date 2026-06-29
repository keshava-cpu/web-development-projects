import React from "react";

import { PublicationEntry, EntryStatus } from "@/types";

interface DashboardListViewProps {
  search: string;
  setSearch: (value: string) => void;
  filteredEntries: PublicationEntry[];
  selectEntry: (entryId: string) => void;
  statusClasses: Record<EntryStatus, string>;
  statusLabels: Record<EntryStatus, string>;
}

const DashboardListView: React.FC<DashboardListViewProps> = ({
  search,
  setSearch,
  filteredEntries,
  selectEntry,
  statusClasses,
  statusLabels,
}) => {
  return (
    <div className="w-full flex-1 flex overflow-hidden bg-surface-50">
      {/* Content */}
      <section className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <div className="rounded-[1.75rem] border border-surface-200 bg-white/95 p-6 shadow-soft backdrop-blur-sm">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-surface-200 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted select-none">
                All entries
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-brand-950">
                Publications
              </h2>
              <p className="mt-2 text-sm text-muted select-none">
                Select an entry to open the detailed dashboard.
              </p>
            </div>
            <label className="block w-full max-w-sm">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                Search entries
              </span>
              <div className="relative mt-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m1.85-5.4a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  className="w-full rounded-2xl border bg-surface-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand-700 focus:bg-white"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, owner, or department"
                />
              </div>
            </label>
          </div>

          <div className="mt-6 grid gap-3">
            {filteredEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => selectEntry(entry.id)}
                className="group w-full min-w-0 rounded-2xl border border-surface-200 bg-surface-50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 h-11 w-1.5 shrink-0 rounded-full bg-brand-700/20 transition group-hover:bg-brand-700" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-brand-950 transition group-hover:text-brand-700">
                          {entry.title}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {entry.owner} · {entry.department}
                        </p>
                      </div>
                      <span
                        className={`rounded-full shrink-0 px-3 py-1 text-xs font-semibold shadow-sm ${statusClasses[entry.status]}`}
                      >
                        {statusLabels[entry.status]}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <p className="mt-3 whitespace-nowrap text-sm text-muted">
                        {entry.summary || "No summary available."}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {filteredEntries.length === 0 && (
              <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-6 text-sm text-muted">
                No entries match your search.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardListView;
