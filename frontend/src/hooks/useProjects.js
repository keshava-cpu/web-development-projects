import { useCallback, useEffect, useState } from "react";
import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
} from "../api/projects";

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
      setError(err.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * addProject
   * Payload: { title, agency, amount, pi, co_pi, status }
   * Note: `title` and file upload removed — not in Supabase spec schema.
   */
  const addProject = useCallback(
    async (formValues) => {
      setSubmitting(true);
      setError(null);

      const payload = {
        title: formValues.title,
        agency: formValues.agency,
        amount: formValues.amount || 0,
        pi: formValues.pi,
        co_pi: formValues.copi || formValues.co_pi || "",
        status: formValues.status || "Pending",
      };

      try {
        const response = await createProject(payload);
        await loadProjects();
        return response;
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to create project.";
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [loadProjects],
  );

  const editProject = useCallback(
    async (id, formValues) => {
      setSubmitting(true);
      setError(null);

      const payload = {
        title: formValues.title, // Include title here
        agency: formValues.agency,
        amount: formValues.amount,
        pi: formValues.pi,
        co_pi: formValues.copi || formValues.co_pi,
        status: formValues.status,
      };

      try {
        const response = await updateProject(id, payload);
        await loadProjects();
        return response;
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to update project.";
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [loadProjects],
  );

  const removeProject = useCallback(
    async (id) => {
      setSubmitting(true);
      setError(null);

      try {
        const response = await deleteProject(id);
        await loadProjects();
        return response;
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to delete project.";
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [loadProjects],
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
    editProject,
    removeProject,
  };
};
