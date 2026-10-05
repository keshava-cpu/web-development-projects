import { useCallback, useEffect, useState } from 'react';
import {
  fetchPatents,
  createPatent as apiCreatePatent,
  updatePatent as apiUpdatePatent,
  deletePatent as apiDeletePatent,
} from '../api/patents';

/**
 * usePatents — mirrors the useProjects hook pattern.
 *
 * Returns:
 *   patents      — array of patent objects
 *   loading      — initial fetch in progress
 *   submitting   — create/update/delete in progress
 *   error        — last error message (string | null)
 *   loadPatents  — manually refetch
 *   addPatent    — create a new patent
 *   editPatent   — update an existing patent
 *   removePatent — delete a patent
 */
export function usePatents() {
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadPatents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPatents();
      setPatents(response.data ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to load patents.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatents();
  }, [loadPatents]);

  const addPatent = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError(null);
      try {
        const response = await apiCreatePatent(payload);
        setPatents((prev) => [response.data, ...prev]);
        return response;
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Failed to create patent.';
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const editPatent = useCallback(
    async (id, payload) => {
      setSubmitting(true);
      setError(null);
      try {
        const response = await apiUpdatePatent(id, payload);
        setPatents((prev) =>
          prev.map((p) => (String(p.patent_id) === String(id) ? response.data : p))
        );
        return response;
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Failed to update patent.';
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const removePatent = useCallback(
    async (id) => {
      setSubmitting(true);
      setError(null);
      try {
        await apiDeletePatent(id);
        setPatents((prev) => prev.filter((p) => String(p.patent_id) !== String(id)));
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Failed to delete patent.';
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return {
    patents,
    loading,
    submitting,
    error,
    loadPatents,
    addPatent,
    editPatent,
    removePatent,
  };
}
