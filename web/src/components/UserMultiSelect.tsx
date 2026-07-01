import { useMemo, useState } from "react";
import { AppUser } from "@/types";
import { filterDirectoryUsers, getDirectoryUserLabel } from "../mockData";

interface UserMultiSelectProps {
  users: AppUser[];
  selected: string[];
  onChange: (values: string[]) => void;
  label: string;
  placeholder?: string;
}

export default function UserMultiSelect({
  users,
  selected,
  onChange,
  label,
  placeholder = "Search users...",
}: UserMultiSelectProps) {
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    return filterDirectoryUsers(users, query);
  }, [query, users]);

  function toggleUser(email: string) {
    if (selected.includes(email)) {
      onChange(selected.filter((value) => value !== email));
      return;
    }

    onChange([...selected, email]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-brand-950">{label}</span>
        <span className="text-xs text-muted">{selected.length} selected</span>
      </div>

      <label className="block">
        <span className="sr-only">Search users</span>
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
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-surface-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
          />
        </div>
      </label>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleUser(value)}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800 transition hover:bg-brand-100"
            >
              {getDirectoryUserLabel(value, users)}
              <span className="text-brand-500">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="max-h-64 overflow-y-auto rounded-2xl border border-surface-200 bg-white p-2 shadow-sm">
        {filteredUsers.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted">
            No users match your search.
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isSelected = selected.includes(user.email);

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => toggleUser(user.email)}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                  isSelected
                    ? "bg-brand-50 ring-1 ring-brand-200"
                    : "hover:bg-surface-50"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-950 text-xs font-semibold text-white">
                  {user.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() ?? "")
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-brand-950">
                      {user.name}
                    </p>
                    <span className="rounded-full bg-surface-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                      {isSelected ? "Added" : user.role}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                  <p className="mt-1 text-xs text-muted">
                    {user.department} · {user.title}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
