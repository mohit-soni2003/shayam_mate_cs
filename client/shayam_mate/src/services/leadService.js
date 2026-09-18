import api from "./api";

// Public — hit by anonymous visitors from the landing page contact form.
export const submitLeadRequest = (payload) => api.post("/public/contact", payload).then((res) => res.data.data);

// Admin/Staff — the Leads section of the dashboard.
export const listLeadsRequest = (status) =>
  api.get("/admin/leads", { params: status ? { status } : {} }).then((res) => res.data.data);

export const updateLeadStatusRequest = (id, status) =>
  api.patch(`/admin/leads/${id}/status`, { status }).then((res) => res.data.data);
