import api from "./api";

export const getComplianceTypeOptionsRequest = () =>
  api.get("/admin/compliance-types/options").then((res) => res.data.data);

export const getAllComplianceTypesRequest = () =>
  api.get("/admin/compliance-types").then((res) => res.data.data);

export const createComplianceTypeRequest = (payload) =>
  api.post("/admin/compliance-types", payload).then((res) => res.data.data);

export const updateComplianceTypeRequest = (id, payload) =>
  api.patch(`/admin/compliance-types/${id}`, payload).then((res) => res.data.data);
