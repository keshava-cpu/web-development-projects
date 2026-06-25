import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PublicationEntry } from "@/types";
import { departments } from "../../mockData";



interface CreateEntryViewProps {
    entryDraft: PublicationEntry;
    shortId: () => string;
    nowStamp: () => string;
    userEmail: string;
    emptyEntry: PublicationEntry;
    setEntries: (value: React.SetStateAction<PublicationEntry[]>) => void;
    setSelectedEntryId: (value: string) => void;
    setEntryDraft: (value: React.SetStateAction<PublicationEntry>) => void;
    addEntryNotification: (title: string, detail: string, queue?: boolean) => void;
}

const CreateEntryView: React.FC<CreateEntryViewProps> = ({
    entryDraft,
    shortId,
    nowStamp,
    userEmail,
    emptyEntry,
    setEntries,
    setSelectedEntryId,
    setEntryDraft,
    addEntryNotification
}) => {

    const navigate = useNavigate();
    const location = useLocation();

    return(
        <div className="flex min-h-screen flex-col bg-surface-50">
              {/* Navigation Bar */}
              <nav className="border-b border-surface-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <h1 className="text-lg font-semibold text-brand-950">Dashboard</h1>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate("/dashboard")}
                          className="rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium text-brand-950 transition hover:bg-surface-200"
                        >
                          List View
                        </button>
                        <button
                          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white"
                        >
                          Create Entry
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
        
              {/* Form Container */}
              <section className="mx-auto w-full max-w-4xl flex-1 px-6 py-6">
                <div className="rounded-[1.75rem] border border-surface-200 bg-white p-8 shadow-soft">
                  <div className="mb-8 border-b border-surface-200 pb-6">
                    <h2 className="text-2xl font-semibold text-brand-950">Create New Entry</h2>
                    <p className="mt-2 text-sm text-muted">Add comprehensive details for your R&D publication</p>
                  </div>
        
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const commitHash = shortId();
                      const initialVersion = {
                        id: shortId(),
                        commitMessage: "Initial draft created",
                        fileName: entryDraft.latestFile || "draft.pdf",
                        updatedAt: nowStamp(),
                        commitHash,
                        author: userEmail || "Unknown"
                      };
                      const newEntry = {
                        id: shortId(),
                        title: entryDraft.title,
                        department: entryDraft.department,
                        owner: userEmail || "Unknown",
                        contributors: entryDraft.contributors.length ? entryDraft.contributors : [userEmail || "Unknown"],
                        status: "draft" as const,
                        summary: entryDraft.summary,
                        latestFile: entryDraft.latestFile || "draft.pdf",
                        updatedAt: nowStamp(),
                        metrics: {
                          messageCount: 0,
                          impactPoints: 0
                        },
                        versions: [initialVersion],
                        timeline: [
                          {
                            id: shortId(),
                            kind: "Created" as const,
                            actor: userEmail || "Unknown",
                            at: nowStamp(),
                            note: "Entry created"
                          }
                        ],
                        messages: [],
                        adminNotes: []
                      };
        
                      try {
                        const response = await fetch("/api/publications", {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(newEntry)
                        });
        
                        if (!response.ok) {
                          throw new Error("Failed to create entry on server");
                        }
        
                        const result = await response.json();
                        setEntries((current) => [result.item, ...current]);
                        setSelectedEntryId(result.item.id);
                        setEntryDraft(emptyEntry);
                        addEntryNotification("Entry created", `"${result.item.title}" has been created successfully.`);
                        navigate(`/dashboard/entries/${result.item.id}`);
                      } catch (err) {
                        console.error(err);
                        addEntryNotification("Creation failed", "Failed to save the entry to the server.");
                      }
                    }}
                    className="space-y-8"
                  >
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-950">Basic Information</h3>
                      
                      <div>
                        <label className="block">
                          <span className="text-sm font-medium text-brand-950">Publication Title *</span>
                          <input
                            type="text"
                            required
                            value={entryDraft.title}
                            onChange={(e) => setEntryDraft((current) => ({ ...current, title: e.target.value }))}
                            className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                            placeholder="Enter the title of your publication"
                          />
                        </label>
                      </div>
        
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-medium text-brand-950">Department *</span>
                          <select
                            required
                            value={entryDraft.department}
                            onChange={(e) => setEntryDraft((current) => ({ ...current, department: e.target.value }))}
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
                          <span className="text-sm font-medium text-brand-950">Latest File</span>
                          <input
                            type="text"
                            value={entryDraft.latestFile}
                            onChange={(e) => setEntryDraft((current) => ({ ...current, latestFile: e.target.value }))}
                            className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                            placeholder="e.g., research-v1.pdf"
                          />
                        </label>
                      </div>
                    </div>
        
                    {/* Contributors */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-950">Contributors</h3>
                      
                      <div>
                        <label className="block">
                          <span className="text-sm font-medium text-brand-950">Add Contributors (comma-separated emails)</span>
                          <textarea
                            value={entryDraft.contributors.join(", ")}
                            onChange={(e) =>
                              setEntryDraft((current) => ({
                                ...current,
                                contributors: e.target.value
                                  .split(",")
                                  .map((c) => c.trim())
                                  .filter((c) => c.length > 0)
                              }))
                            }
                            rows={3}
                            className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                            placeholder="prof.amit@college.edu, dr.sharma@college.edu"
                          />
                        </label>
                      </div>
                    </div>
        
                    {/* Summary & Description */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-950">Summary & Description</h3>
                      
                      <div>
                        <label className="block">
                          <span className="text-sm font-medium text-brand-950">Research Summary *</span>
                          <textarea
                            required
                            value={entryDraft.summary}
                            onChange={(e) => setEntryDraft((current) => ({ ...current, summary: e.target.value }))}
                            rows={6}
                            className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                            placeholder="Provide a comprehensive summary of your research, methodology, findings, and implications..."
                          />
                        </label>
                      </div>
                    </div>
        
                    {/* Metrics & Impact */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-950">Metrics & Impact</h3>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-medium text-brand-950">Impact Points</span>
                          <input
                            type="number"
                            min="0"
                            value={entryDraft.metrics.impactPoints}
                            onChange={(e) =>
                              setEntryDraft((current) => ({
                                ...current,
                                metrics: { ...current.metrics, impactPoints: parseInt(e.target.value) || 0 }
                              }))
                            }
                            className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                          />
                        </label>
        
                        <label className="block">
                          <span className="text-sm font-medium text-brand-950">Message Count</span>
                          <input
                            type="number"
                            min="0"
                            value={entryDraft.metrics.messageCount}
                            onChange={(e) =>
                              setEntryDraft((current) => ({
                                ...current,
                                metrics: { ...current.metrics, messageCount: parseInt(e.target.value) || 0 }
                              }))
                            }
                            className="mt-2 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/30"
                          />
                        </label>
                      </div>
                    </div>
        
                    {/* Action Buttons */}
                    <div className="flex gap-3 border-t border-surface-200 pt-6">
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-800 active:shadow-sm"
                      >
                        Create Entry
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="rounded-xl border border-surface-200 bg-surface-50 px-6 py-3 text-sm font-semibold text-brand-950 transition hover:bg-surface-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </section>
        </div>
    );
}

export default CreateEntryView;