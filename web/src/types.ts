export type Role = "faculty" | "admin";

export type EntryStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "approved_for_publication"
  | "published"
  | "closed";

export type MessageScope = "entry" | "direct";

export type TimelineEventKind =
  | "Created"
  | "Edited"
  | "StatusChanged"
  | "ReviewRequested"
  | "ReviewApproved"
  | "ReviewRejected"
  | "Merged"
  | "CommentAdded"
  | "Closed"
  | "Reopened";

export interface PublicationVersion {
  id: string;
  commitMessage: string;
  fileName: string;
  updatedAt: string;
  commitHash?: string;
  author?: string;
}

export interface TimelineEvent {
  id: string;
  kind: TimelineEventKind;
  actor: string;
  note: string;
  at: string;
  details?: {
    fromStatus?: EntryStatus;
    toStatus?: EntryStatus;
    commitHash?: string;
  };
}

export interface ConversationMessage {
  id: string;
  scope: MessageScope;
  author: string;
  audience: string;
  text: string;
  at: string;
  isPinned?: boolean;
}

export interface PublicationEntry {
  id: string;
  title: string;
  department: string;
  owner: string;
  contributors: string[];
  status: EntryStatus;
  summary: string;
  latestFile: string;
  updatedAt: string;
  reviewRequestedAt?: string;
  metrics: {
    messageCount: number;
    impactPoints: number;
  };
  versions: PublicationVersion[];
  timeline: TimelineEvent[];
  messages: ConversationMessage[];
  adminNotes: string[];
  reviewers?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  unread: boolean;
}

export interface FacultyProfileSummary {
  displayName: string;
  email: string;
  role: Role;
  department: string;
  ownedEntries: PublicationEntry[];
  activeEntries: number;
  publishedEntries: number;
  unreadNotifications: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  title: string;
  office: string;
  expertise: string[];
  bio: string;
}
