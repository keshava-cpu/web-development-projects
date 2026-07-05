import { useCallback, useEffect, useState } from 'react';
import { createProject, fetchProjects } from '../api/projects';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchProjects();
      setProjects(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProject = useCallback(
    async (formValues) => {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', formValues.title);
      formData.append('agency', formValues.agency);
      formData.append('amount', String(formValues.amount || 0));
      formData.append('pi', formValues.pi);
      formData.append('copi', formValues.copi || '');
      formData.append('status', formValues.status || 'Pending');

      if (formValues.utilizationReport) {
        formData.append('utilization_report', formValues.utilizationReport);
      }

      try {
        const response = await createProject(formData);
        await loadProjects();
        return response;
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to create project.';
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [loadProjects]
  );

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    submitting,
    error,
    loadProjects,
    addProject,
  };
};
