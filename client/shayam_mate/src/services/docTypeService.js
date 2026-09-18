import api from "./api";

export const getAllDocTypesRequest = () => api.get("/admin/doc-types").then((res) => res.data.data);

export const createDocTypeRequest = (name) =>
  api.post("/admin/doc-types", { name }).then((res) => res.data.data);

export const updateDocTypeRequest = (id, updates) =>
  api.patch(`/admin/doc-types/${id}`, updates).then((res) => res.data.data);
