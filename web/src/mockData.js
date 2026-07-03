export const departments = [
    "CSE",
    "ECE",
    "Mechanical",
    "Civil",
    "Chemistry",
    "Physics",
];
export const directoryUsers = [
    {
        id: "u1",
        name: "Dr. Meera Iyer",
        email: "meera.iyer@vnrvjiet.in",
        role: "faculty",
        department: "ECE",
        title: "Associate Professor",
        office: "R&D Block 204",
        expertise: [
            "Federated Learning",
            "Energy Forecasting",
            "Signal Processing",
        ],
        bio: "Works on campus-scale machine learning systems and applied optimization for smart infrastructure.",
    },
    {
        id: "u2",
        name: "Prof. Ananya Rao",
        email: "ananya.rao@vnrvjiet.in",
        role: "faculty",
        department: "Civil",
        title: "Professor",
        office: "Civil Wing 110",
        expertise: ["Water Quality", "Sensing Networks", "Field Instrumentation"],
        bio: "Focuses on environmental sensing, sustainable water systems, and low-cost field deployments.",
    },
    {
        id: "u3",
        name: "Dr. Raghav Menon",
        email: "raghav.menon@vnrvjiet.in",
        role: "faculty",
        department: "CSE",
        title: "Assistant Professor",
        office: "CSE Block 312",
        expertise: ["Graph Algorithms", "Repository Mining", "Duplicate Detection"],
        bio: "Researches data quality, scholarly systems, and graph-based retrieval tooling.",
    },
    {
        id: "u4",
        name: "Arun V.",
        email: "arun.v@vnrvjiet.in",
        role: "faculty",
        department: "ECE",
        title: "Research Associate",
        office: "Innovation Lab 02",
        expertise: ["Experiment Design", "Embedded Systems", "Prototype Testing"],
        bio: "Supports applied research teams with experiments, instrumentation, and prototype validation.",
    },
    {
        id: "u5",
        name: "S. Kumar",
        email: "s.kumar@vnrvjiet.in",
        role: "faculty",
        department: "Civil",
        title: "Project Fellow",
        office: "Civil Lab 14",
        expertise: ["Field Surveys", "Sample Collection", "Water Testing"],
        bio: "Coordinates field work and collects data for infrastructure and environmental research projects.",
    },
    {
        id: "u6",
        name: "Research Cell",
        email: "research.cell@vnrvjiet.in",
        role: "faculty",
        department: "Research Cell",
        title: "Support Team",
        office: "Admin Annex 3",
        expertise: ["Compliance", "Proof Review", "Archive Support"],
        bio: "Handles entry review, proof verification, and research record support across departments.",
    },
    {
        id: "u7",
        name: "Admin User",
        email: "admin1@vnrvjiet.in",
        role: "admin",
        department: "Administration",
        title: "Platform Admin",
        office: "Admin Block 01",
        expertise: ["Approvals", "Audit", "Workflow Review"],
        bio: "Maintains the publication workflow, approvals, and record integrity for the platform.",
    },
    {
        id: "u8",
        name: "Dr. Faculty One",
        email: "faculty1@vnrvjiet.in",
        role: "faculty",
        department: "ECE",
        title: "Assistant Professor",
        office: "ECE Block 101",
        expertise: ["AI Systems", "Research Coordination"],
        bio: "Sample faculty account used for testing research publication workflows.",
    },
    {
        id: "u9",
        name: "Dr. Faculty Two",
        email: "faculty2@vnrvjiet.in",
        role: "faculty",
        department: "Civil",
        title: "Associate Professor",
        office: "Civil Block 210",
        expertise: ["Water Systems", "Publication Management"],
        bio: "Sample faculty account used for testing publication approvals and profile search.",
    },
];
export function findDirectoryUser(identifier, users = directoryUsers) {
    const query = identifier.trim().toLowerCase();
    return users.find((user) => {
        return (user.email.toLowerCase() === query ||
            user.name.toLowerCase() === query ||
            user.email.toLowerCase().includes(query) ||
            user.name.toLowerCase().includes(query));
    });
}
export function getDirectoryUserLabel(identifier, users = directoryUsers) {
    return findDirectoryUser(identifier, users)?.name || identifier;
}
export function filterDirectoryUsers(users, query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
        return users;
    }
    return users.filter((user) => {
        return (user.name.toLowerCase().includes(normalized) ||
            user.email.toLowerCase().includes(normalized) ||
            user.department.toLowerCase().includes(normalized) ||
            user.title.toLowerCase().includes(normalized) ||
            user.expertise.some((item) => item.toLowerCase().includes(normalized)));
    });
}
export const defaultNotifications = [
    {
        id: "n1",
        title: "New publication created",
        detail: "A faculty member created a draft entry in CSE.",
        createdAt: "Today · 09:15",
        unread: true,
    },
    {
        id: "n2",
        title: "Review requested",
        detail: "A paper has been marked ready for admin audit.",
        createdAt: "Today · 10:40",
        unread: true,
    },
];
export const sampleEntries = [
    {
        id: "pub-001",
        title: "Federated Learning for Campus Energy Forecasting",
        department: "ECE",
        owner: "meera.iyer@vnrvjiet.in",
        contributors: [
            "meera.iyer@vnrvjiet.in",
            "arun.v@vnrvjiet.in",
            "research.cell@vnrvjiet.in",
        ],
        status: "in_review",
        summary: "First journal submission draft with updated graphs and citation cleanup.",
        latestFile: "draft-v3.pdf",
        updatedAt: "Today · 11:05",
        reviewRequestedAt: "Today · 10:55",
        metrics: {
            messageCount: 4,
            impactPoints: 18,
        },
        versions: [
            {
                id: "v1",
                commitMessage: "Initial concept and abstract",
                fileName: "draft-v1.pdf",
                updatedAt: "Mon · 09:20",
                commitHash: "abc1234567",
                author: "Dr. Meera Iyer",
            },
            {
                id: "v2",
                commitMessage: "Updated methodology graphics",
                fileName: "draft-v2.pdf",
                updatedAt: "Tue · 14:10",
                commitHash: "def2345678",
                author: "Dr. Meera Iyer",
            },
            {
                id: "v3",
                commitMessage: "Prepared for audit",
                fileName: "draft-v3.pdf",
                updatedAt: "Today · 11:05",
                commitHash: "ghi3456789",
                author: "Dr. Meera Iyer",
            },
        ],
        timeline: [
            {
                id: "t1",
                kind: "Created",
                actor: "Dr. Meera Iyer",
                note: "Created the publication entry and uploaded the first draft.",
                at: "Mon · 09:15",
            },
            {
                id: "t2",
                kind: "Edited",
                actor: "Dr. Meera Iyer",
                note: "Added co-authors and revised the introduction.",
                at: "Tue · 14:05",
                details: {
                    commitHash: "abc1234",
                },
            },
            {
                id: "t3",
                kind: "ReviewRequested",
                actor: "Dr. Meera Iyer",
                note: "Requested department head review for approval.",
                at: "Today · 10:55",
                details: { fromStatus: "draft", toStatus: "in_review" },
            },
        ],
        messages: [
            {
                id: "m1",
                scope: "entry",
                author: "Dr. Meera Iyer",
                audience: "Admin",
                text: "Please check the revised figures before approval.",
                at: "Today · 10:58",
            },
            {
                id: "m2",
                scope: "entry",
                author: "Admin Desk",
                audience: "Dr. Meera Iyer",
                text: "Looks good. Please add the latest experimental table.",
                at: "Today · 11:01",
            },
        ],
        adminNotes: ["Needs final plagiarism check before approval."],
    },
    {
        id: "pub-002",
        title: "Low-Cost Water Quality Sensing Network",
        department: "Civil",
        owner: "ananya.rao@vnrvjiet.in",
        contributors: ["ananya.rao@vnrvjiet.in", "s.kumar@vnrvjiet.in"],
        status: "approved_for_publication",
        summary: "Conference paper cleared by the department head and waiting for proof upload.",
        latestFile: "camera-ready.pdf",
        updatedAt: "Yesterday · 16:40",
        metrics: {
            messageCount: 6,
            impactPoints: 24,
        },
        versions: [
            {
                id: "v1",
                commitMessage: "Abstract and field setup",
                fileName: "draft-v1.pdf",
                updatedAt: "Fri · 08:30",
                commitHash: "jkl4567890",
                author: "Prof. Ananya Rao",
            },
            {
                id: "v2",
                commitMessage: "Final formatting for submission",
                fileName: "camera-ready.pdf",
                updatedAt: "Yesterday · 16:40",
                commitHash: "mno5678901",
                author: "Prof. Ananya Rao",
            },
        ],
        timeline: [
            {
                id: "t1",
                kind: "ReviewApproved",
                actor: "Department Head",
                note: "Approved for publication after review.",
                at: "Yesterday · 15:55",
                details: {
                    fromStatus: "in_review",
                    toStatus: "approved_for_publication",
                },
            },
            {
                id: "t2",
                kind: "Edited",
                actor: "Prof. Ananya Rao",
                note: "Uploaded camera-ready PDF and proof checklist.",
                at: "Yesterday · 16:40",
                details: { commitHash: "def5678" },
            },
        ],
        messages: [
            {
                id: "m1",
                scope: "entry",
                author: "Department Head",
                audience: "Prof. Ananya Rao",
                text: "Please keep the final proof receipt in this thread.",
                at: "Yesterday · 16:05",
            },
        ],
        adminNotes: ["Awaiting DOI and publication proof."],
    },
    {
        id: "pub-003",
        title: "Graph-Based Duplicate Detection in Scholarly Repositories",
        department: "CSE",
        owner: "raghav.menon@vnrvjiet.in",
        contributors: ["raghav.menon@vnrvjiet.in"],
        status: "published",
        summary: "Published journal article with archive proof attached.",
        latestFile: "final-proof.pdf",
        updatedAt: "2 days ago",
        metrics: {
            messageCount: 2,
            impactPoints: 34,
        },
        versions: [
            {
                id: "v1",
                commitMessage: "Initial submission",
                fileName: "submission.pdf",
                updatedAt: "Last week",
                commitHash: "pqr6789012",
                author: "Dr. Raghav Menon",
            },
            {
                id: "v2",
                commitMessage: "Attached DOI and proof of publication",
                fileName: "final-proof.pdf",
                updatedAt: "2 days ago",
                commitHash: "stu7890123",
                author: "Dr. Raghav Menon",
            },
        ],
        timeline: [
            {
                id: "t1",
                kind: "Merged",
                actor: "Dr. Raghav Menon",
                note: "Uploaded DOI and journal proof.",
                at: "2 days ago",
                details: {
                    fromStatus: "approved_for_publication",
                    toStatus: "published",
                },
            },
            {
                id: "t2",
                kind: "Closed",
                actor: "Admin Desk",
                note: "Entry closed after verification.",
                at: "2 days ago",
                details: { fromStatus: "published", toStatus: "closed" },
            },
        ],
        messages: [
            {
                id: "m1",
                scope: "entry",
                author: "Dr. Raghav Menon",
                audience: "Admin",
                text: "Proof has been attached for archival.",
                at: "2 days ago",
            },
        ],
        adminNotes: ["Closed entry counted toward department score."],
    },
];
export const initialRole = "faculty";
