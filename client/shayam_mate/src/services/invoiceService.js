import api from "./api";

// Admin
export const getAllInvoicesRequest = () => api.get("/admin/invoices").then((res) => res.data.data);

export const markInvoicePaidRequest = (id) => api.patch(`/admin/invoices/${id}/pay`).then((res) => res.data.data);

export const createInvoiceRequest = (serviceRequestId, payload) =>
  api.post(`/admin/service-requests/${serviceRequestId}/invoice`, payload).then((res) => res.data.data);

// Client
export const getMyInvoicesRequest = () => api.get("/client/invoices").then((res) => res.data.data);
