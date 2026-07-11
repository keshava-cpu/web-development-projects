import apiClient from './client';

// ─── Notifications API ────────────────────────────────────────────────────────
// Endpoint: /api/notifications (protected, Bearer token)
// All operations scoped to the authenticated user.

export const fetchNotifications = async () => {
  const { data } = await apiClient.get('/notifications');
  return data;
};

export const createNotification = async (payload) => {
  const { data } = await apiClient.post('/notifications', payload);
  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await apiClient.patch(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await apiClient.patch('/notifications/read-all');
  return data;
};

export const deleteNotification = async (id) => {
  const { data } = await apiClient.delete(`/notifications/${id}`);
  return data;
};
