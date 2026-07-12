// src/api/publications.js
import apiClient from "./client";

export const fetchPublications = async () => {
  const { data } = await apiClient.get("/keshava/publications");
  return data;
};

export const createPublication = async (payload) => {
  const { data } = await apiClient.post("/keshava/publications", payload);
  return data;
};

export const updatePublication = async (id, payload) => {
  const { data } = await apiClient.put(`/keshava/publications/${id}`, payload);
  return data;
};

export const deletePublication = async (id) => {
  const { data } = await apiClient.delete(`/keshava/publications/${id}`);
  return data;
};
