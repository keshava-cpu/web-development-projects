/**
 * Keshava in-memory publications data.
 * Converted from server/src/data.js (ESM → CommonJS).
 */
const apiEntries = [
  {
    id: "pub-001",
    title: "Federated Learning for Campus Energy Forecasting",
    department: "ECE",
    owner: "faculty1@vnrvjiet.in",
    contributors: [
      "faculty1@vnrvjiet.in",
      "arun.v@vnrvjiet.in",
      "research.cell@vnrvjiet.in",
    ],
    status: "in_review",
    summary: "First journal submission draft with updated graphs and citation cleanup.",
    latestFile: "draft-v3.pdf",
    updatedAt: "Today · 11:05",
    reviewRequestedAt: "Today · 10:55",
    metrics: { messageCount: 4, impactPoints: 18 },
    versions: [
      { id: "v1", commitMessage: "Initial concept and abstract", fileName: "draft-v1.pdf", updatedAt: "Mon · 09:20", commitHash: "abc1234567", author: "Dr. Meera Iyer" },
      { id: "v2", commitMessage: "Updated methodology graphics", fileName: "draft-v2.pdf", updatedAt: "Tue · 14:10", commitHash: "def2345678", author: "Dr. Meera Iyer" },
      { id: "v3", commitMessage: "Prepared for audit", fileName: "draft-v3.pdf", updatedAt: "Today · 11:05", commitHash: "ghi3456789", author: "Dr. Meera Iyer" },
    ],
    timeline: [
      { id: "t1", kind: "Created", actor: "Dr. Meera Iyer", note: "Created the publication entry and uploaded the first draft.", at: "Mon · 09:15" },
      { id: "t2", kind: "Edited", actor: "Dr. Meera Iyer", note: "Added co-authors and revised the introduction.", at: "Tue · 14:05", details: { commitHash: "abc1234" } },
      { id: "t3", kind: "ReviewRequested", actor: "Dr. Meera Iyer", note: "Requested department head review for approval.", at: "Today · 10:55", details: { fromStatus: "draft", toStatus: "in_review" } },
    ],
    messages: [
      { id: "m1", scope: "entry", author: "Dr. Meera Iyer", audience: "Admin", text: "Please check the revised figures before approval.", at: "Today · 10:58" },
      { id: "m2", scope: "entry", author: "Admin Desk", audience: "Dr. Meera Iyer", text: "Looks good. Please add the latest experimental table.", at: "Today · 11:01" },
    ],
    adminNotes: ["Needs final plagiarism check before approval."],
  },
  {
    id: "pub-002",
    title: "Low-Cost Water Quality Sensing Network",
    department: "Civil",
    owner: "Prof. Ananya Rao",
    contributors: ["ananya.rao@vnrvjiet.in", "s.kumar@vnrvjiet.in"],
    status: "approved_for_publication",
    summary: "Conference paper cleared by the department head and waiting for proof upload.",
    latestFile: "camera-ready.pdf",
    updatedAt: "Yesterday · 16:40",
    metrics: { messageCount: 6, impactPoints: 24 },
    versions: [
      { id: "v1", commitMessage: "Abstract and field setup", fileName: "draft-v1.pdf", updatedAt: "Fri · 08:30", commitHash: "jkl4567890", author: "Prof. Ananya Rao" },
      { id: "v2", commitMessage: "Final formatting for submission", fileName: "camera-ready.pdf", updatedAt: "Yesterday · 16:40", commitHash: "mno5678901", author: "Prof. Ananya Rao" },
    ],
    timeline: [
      { id: "t1", kind: "ReviewApproved", actor: "Department Head", note: "Approved for publication after review.", at: "Yesterday · 15:55", details: { fromStatus: "in_review", toStatus: "approved_for_publication" } },
      { id: "t2", kind: "Edited", actor: "Prof. Ananya Rao", note: "Uploaded camera-ready PDF and proof checklist.", at: "Yesterday · 16:40", details: { commitHash: "def5678" } },
    ],
    messages: [
      { id: "m1", scope: "entry", author: "Department Head", audience: "Prof. Ananya Rao", text: "Please keep the final proof receipt in this thread.", at: "Yesterday · 16:05" },
    ],
    adminNotes: ["Awaiting DOI and publication proof."],
  },
  {
    id: "pub-003",
    title: "Graph-Based Duplicate Detection in Scholarly Repositories",
    department: "CSE",
    owner: "Dr. Raghav Menon",
    contributors: ["raghav.menon@vnrvjiet.in"],
    status: "published",
    summary: "Published journal article with archive proof attached.",
    latestFile: "final-proof.pdf",
    updatedAt: "2 days ago",
    metrics: { messageCount: 2, impactPoints: 34 },
    versions: [
      { id: "v1", commitMessage: "Initial submission", fileName: "submission.pdf", updatedAt: "Last week", commitHash: "pqr6789012", author: "Dr. Raghav Menon" },
      { id: "v2", commitMessage: "Attached DOI and proof of publication", fileName: "final-proof.pdf", updatedAt: "2 days ago", commitHash: "stu7890123", author: "Dr. Raghav Menon" },
    ],
    timeline: [
      { id: "t1", kind: "Merged", actor: "Dr. Raghav Menon", note: "Uploaded DOI and journal proof.", at: "2 days ago", details: { fromStatus: "approved_for_publication", toStatus: "published" } },
      { id: "t2", kind: "Closed", actor: "Admin Desk", note: "Entry closed after verification.", at: "2 days ago", details: { fromStatus: "published", toStatus: "closed" } },
    ],
    messages: [
      { id: "m1", scope: "entry", author: "Dr. Raghav Menon", audience: "Admin", text: "Proof has been attached for archival.", at: "2 days ago" },
    ],
    adminNotes: ["Closed entry counted toward department score."],
  },
];

module.exports = { apiEntries };
