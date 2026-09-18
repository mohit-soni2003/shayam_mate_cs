import api from "./api";

// Client
export const getAvailableServicesRequest = (entityId) =>
  api.get(`/client/entities/${entityId}/services`).then((res) => res.data.data);

export const createServiceRequestRequest = (entityId, complianceTypeId) =>
  api.post(`/client/entities/${entityId}/service-requests`, { complianceTypeId }).then((res) => res.data.data);

export const getMyServiceRequestsRequest = (entityId) =>
  api.get(`/client/entities/${entityId}/service-requests`).then((res) => res.data.data);

// Admin
export const listServiceRequestsRequest = (status) =>
  api
    .get("/admin/service-requests", { params: status ? { status } : {} })
    .then((res) => res.data.data);

export const approveServiceRequestRequest = (id, payload) =>
  api.post(`/admin/service-requests/${id}/approve`, payload).then((res) => res.data.data);

export const rejectServiceRequestRequest = (id, reason) =>
  api.post(`/admin/service-requests/${id}/reject`, { reason }).then((res) => res.data.data);

export const getServiceRequestByIdRequest = (id) =>
  api.get(`/admin/service-requests/${id}`).then((res) => res.data.data);
