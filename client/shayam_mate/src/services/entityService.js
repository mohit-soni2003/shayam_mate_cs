import api from "./api";

// Client
export const getMyEntitiesRequest = () => api.get("/client/entities").then((res) => res.data.data);

// Admin
export const getAllEntitiesRequest = () => api.get("/admin/entities").then((res) => res.data.data);

export const createEntityRequest = (payload) =>
  api.post("/admin/entities", payload).then((res) => res.data.data);

export const assignClientToEntityRequest = (entityId, userId) =>
  api.post(`/admin/entities/${entityId}/clients`, { userId }).then((res) => res.data.data);
