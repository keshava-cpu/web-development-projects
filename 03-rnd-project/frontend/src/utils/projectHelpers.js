export const normalizeStatus = (status = "") => status.trim().toLowerCase();

export const getStatusColorKey = (status) => {
  const normalized = normalizeStatus(status);

  if (["approved", "completed"].includes(normalized)) return normalized;
  if (normalized === "pending") return "pending";
  if (normalized === "rejected") return "rejected";
  // Treat 'ongoing' as 'active' for styling/colors
  if (["active", "ongoing"].includes(normalized)) return "active";

  return "pending";
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export const groupProjectsByStatus = (projects) => ({
  // Catch both 'active' and 'ongoing' from the DB and put them into the Active UI tab
  active: projects.filter((project) =>
    ["active", "ongoing"].includes(normalizeStatus(project.status)),
  ),
  pending: projects.filter(
    (project) => normalizeStatus(project.status) === "pending",
  ),
  completed: projects.filter((project) =>
    ["completed", "approved"].includes(normalizeStatus(project.status)),
  ),
  rejected: projects.filter(
    (project) => normalizeStatus(project.status) === "rejected",
  ),
});
