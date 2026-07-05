export const normalizeStatus = (status = '') => status.trim().toLowerCase();

export const getStatusColorKey = (status) => {
  const normalized = normalizeStatus(status);

  if (['approved', 'completed'].includes(normalized)) return normalized;
  if (normalized === 'pending') return 'pending';
  if (normalized === 'rejected') return 'rejected';
  if (normalized === 'active') return 'active';

  return 'pending';
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export const groupProjectsByStatus = (projects) => ({
  active: projects.filter((project) => normalizeStatus(project.status) === 'active'),
  pending: projects.filter((project) => normalizeStatus(project.status) === 'pending'),
  completed: projects.filter((project) =>
    ['completed', 'approved'].includes(normalizeStatus(project.status))
  ),
  rejected: projects.filter((project) => normalizeStatus(project.status) === 'rejected'),
});
