/**
 * mockData.js — utility functions only
 *
 * The hardcoded dummy data arrays (sampleEntries, defaultNotifications,
 * directoryUsers, initialRole) have been removed. All data now comes from
 * the live API (/api/keshava/publications, /api/notifications).
 *
 * Kept: pure utility functions that operate on dynamic data passed in as arguments.
 */

export const departments = [
  "CSE",
  "ECE",
  "Mechanical",
  "Civil",
  "Chemistry",
  "Physics",
];

export function findDirectoryUser(identifier, users = []) {
  const query = identifier.trim().toLowerCase();
  return users.find((user) => {
    return (
      user.email.toLowerCase() === query ||
      user.name.toLowerCase() === query ||
      user.email.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query)
    );
  });
}

export function getDirectoryUserLabel(identifier, users = []) {
  return findDirectoryUser(identifier, users)?.name || identifier;
}

export function filterDirectoryUsers(users, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return users;
  }
  return users.filter((user) => {
    return (
      user.name.toLowerCase().includes(normalized) ||
      user.email.toLowerCase().includes(normalized) ||
      (user.department || "").toLowerCase().includes(normalized) ||
      (user.title || "").toLowerCase().includes(normalized) ||
      (user.expertise || []).some((item) =>
        item.toLowerCase().includes(normalized),
      )
    );
  });
}
