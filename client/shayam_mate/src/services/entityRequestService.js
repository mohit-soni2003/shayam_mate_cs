import api from "./api";

// Client
export const createEntityRequestRequest = (payload) =>
  api.post("/client/entity-requests", payload).then((res) => res.data.data);

export const getMyEntityRequestsRequest = () =>
  api.get("/client/entity-requests").then((res) => res.data.data);

// Admin
export const listEntityRequestsRequest = (status) =>
  api.get("/admin/entity-requests", { params: status ? { status } : {} }).then((res) => res.data.data);

export const approveEntityRequestRequest = (id) =>
  api.post(`/admin/entity-requests/${id}/approve`).then((res) => res.data.data);

export const rejectEntityRequestRequest = (id, reason) =>
  api.post(`/admin/entity-requests/${id}/reject`, { reason }).then((res) => res.data.data);
