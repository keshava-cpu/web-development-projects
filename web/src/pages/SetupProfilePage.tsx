import { useMemo, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AppUser, Role } from "@/types";

const DEPARTMENTS = [
  "Computer Science",
  "Data Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Mathematics",
  "Physics",
  "Research Cell",
];

const TITLES = [
  "Assistant Professor",
  "Associate Professor",
  "Professor",
  "Research Scientist",
  "Lab Director",
  "Faculty",
];

interface SetupProfilePageProps {
  initialName: string;
  initialEmail: string;
  initialRole: Role;
  initialTitle?: string;
  initialDepartment?: string;
  initialOffice?: string;
  initialExpertise?: string;
  initialBio?: string;
  onSave: (profile: AppUser) => void;
  isEdit?: boolean;
}

export default function SetupProfilePage({
  initialName,
  initialEmail,
  initialRole,
  initialTitle = "Faculty",
  initialDepartment = "Research Cell",
  initialOffice = "",
  initialExpertise = "",
  initialBio = "",
  onSave,
  isEdit = false,
}: SetupProfilePageProps) {
  const [fullName, setFullName] = useState(initialName);
  const [title, setTitle] = useState(initialTitle);
  const [department, setDepartment] = useState(initialDepartment);
  const [office, setOffice] = useState(initialOffice);
  const [expertise, setExpertise] = useState(initialExpertise);
  const [bio, setBio] = useState(initialBio);
  const [isSaving, setIsSaving] = useState(false);

  const expertiseTags = useMemo(
    () =>
      expertise
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [expertise],
  );

  const canSave =
    fullName.trim().length > 0 &&
    department.trim().length > 0 &&
    title.trim().length > 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-8 rounded-3xl bg-slate-50 p-8">
          <h1 className="text-3xl font-semibold text-brand-950">
            {isEdit
              ? "Update your researcher profile"
              : "Welcome to your new researcher profile"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {isEdit
              ? "Edit your profile details so your colleagues and dashboard stay current."
              : "Complete your profile so the dashboard can show your department, expertise, and contact details. This is the first step after signing in with Google."}
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (isSaving || !canSave) return;
            setIsSaving(true);
            onSave({
              id: initialEmail.toLowerCase(),
              name: fullName.trim() || initialName,
              email: initialEmail,
              role: initialRole,
              department: department.trim() || "Research Cell",
              title: title.trim() || "Faculty",
              office: office.trim() || "",
              expertise: expertiseTags,
              bio: bio.trim(),
            });
          }}
          className="space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                Full name
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                  Required
                </span>
              </span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
                placeholder="Dr. Meera Iyer"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-900">
                Email address
              </span>
              <input
                value={initialEmail}
                disabled
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none"
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Role</span>
              <input
                value={initialRole}
                disabled
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none"
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                Department
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                  Required
                </span>
              </span>
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
              >
                <option value="" disabled>
                  Select a department
                </option>
                {DEPARTMENTS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                Title
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                  Required
                </span>
              </span>
              <select
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
              >
                <option value="" disabled>
                  Select a title
                </option>
                {TITLES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-900">
              Office location
            </span>
            <input
              value={office}
              onChange={(event) => setOffice(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
              placeholder="Research Cell, Block B"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-900">
              Expertise
            </span>
            <input
              value={expertise}
              onChange={(event) => setExpertise(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
              placeholder="AI, Machine Learning, Security"
            />
            <p className="mt-2 text-xs text-slate-500">
              Separate with commas; we will store each tag.
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-900">Bio</span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
              placeholder="Add a short profile summary to help colleagues identify you."
            />
          </label>

          {expertiseTags.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Expertise preview
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {expertiseTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {isEdit ? "Update your profile" : "One more step"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {isEdit
                  ? "Save updates to your profile details."
                  : "Save your profile to continue into the dashboard."}
              </p>
            </div>
            <button
              type="submit"
              disabled={!canSave || isSaving}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-brand-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size={16} className="text-white" />
                  {isEdit ? "Saving profile..." : "Saving and continuing..."}
                </>
              ) : isEdit ? (
                "Save profile"
              ) : (
                "Save profile and continue"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
