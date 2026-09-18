import api from "./api";

const toFormData = ({ file, docName, docType, clientRemark, entityIds }) => {
  const formData = new FormData();
  formData.append("file", file);
  if (docName) formData.append("docName", docName);
  if (docType) formData.append("docType", docType);
  if (clientRemark) formData.append("clientRemark", clientRemark);
  if (entityIds && entityIds.length > 0) formData.append("entityIds", JSON.stringify(entityIds));
  return formData;
};

// Client — onUploadProgress(percent) reports the file-transfer phase; the
// server's own processing (Cloudinary + DB write) after that isn't measurable
// from the client, which is why the UI switches to an indeterminate spinner
// once this hits 100.
export const uploadDocumentRequest = (payload, onUploadProgress) =>
  api
    .post("/documents", toFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onUploadProgress
        ? (event) => onUploadProgress(event.total ? Math.round((event.loaded / event.total) * 100) : 0)
        : undefined,
    })
    .then((res) => res.data.data);

export const reuploadDocumentRequest = (id, payload) =>
  api
    .post(`/documents/${id}/reupload`, toFormData(payload), { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data.data);

// params: { status, docType, search, sortBy, sortOrder }
export const getMyDocumentsRequest = (params = {}) =>
  api.get("/documents/mine", { params }).then((res) => res.data.data);

// Shared
export const getDocumentByIdRequest = (id) => api.get(`/documents/${id}`).then((res) => res.data.data);

export const getDocumentDownloadUrlRequest = (id) =>
  api.get(`/documents/${id}/download-url`).then((res) => res.data.data);

// Admin / Staff — params: { status, docType, search, sortBy, sortOrder }
export const getAllDocumentsRequest = (params = {}) =>
  api.get("/documents", { params }).then((res) => res.data.data);

export const staffReviewDocumentRequest = (id, staffRemark) =>
  api.patch(`/documents/${id}/staff-review`, { staffRemark }).then((res) => res.data.data);

export const verifyDocumentRequest = (id) => api.patch(`/documents/${id}/verify`).then((res) => res.data.data);

export const rejectDocumentRequest = (id, reason) =>
  api.patch(`/documents/${id}/reject`, { reason }).then((res) => res.data.data);

export const attachEntityToDocumentRequest = (id, entityId) =>
  api.post(`/documents/${id}/entities`, { entityId }).then((res) => res.data.data);

export const detachEntityFromDocumentRequest = (id, entityId) =>
  api.delete(`/documents/${id}/entities/${entityId}`).then((res) => res.data.data);
