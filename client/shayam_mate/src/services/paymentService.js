import api from "./api";

export const createPaymentOrderRequest = (invoiceId) =>
  api.post(`/client/invoices/${invoiceId}/pay`).then((res) => res.data.data);

export const verifyPaymentRequest = (invoiceId, payload) =>
  api.post(`/client/invoices/${invoiceId}/verify`, payload).then((res) => res.data.data);
