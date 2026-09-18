import api from "./api";

export const getAllClientsRequest = () => api.get("/admin/clients").then((res) => res.data.data);

export const getClientByIdRequest = (id) => api.get(`/admin/clients/${id}`).then((res) => res.data.data);

export const getAllStaffRequest = () => api.get("/admin/staff").then((res) => res.data.data);

export const createStaffRequest = (email, password, fullName) =>
  api.post("/admin/staff", { email, password, fullName }).then((res) => res.data.data);

export const updateStaffRequest = (id, updates) =>
  api.patch(`/admin/staff/${id}`, updates).then((res) => res.data.data);
