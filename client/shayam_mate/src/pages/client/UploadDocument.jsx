import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEntityStore } from "../../store/entityStore";
import { getComplianceTypeOptionsRequest } from "../../services/complianceTypeService";
import { uploadDocumentRequest } from "../../services/documentService";
import { UploadCloudIcon, FileIcon, XIcon } from "../../component/common/icons";
import { SkeletonBlock } from "../../component/common/Skeleton";

const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,.webp";
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const emptyForm = { file: null, docName: "", docType: "", clientRemark: "", entityIds: [] };

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UploadDocument = () => {
  const navigate = useNavigate();
  const { entities } = useEntityStore();
  const fileInputRef = useRef(null);

  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [isDragActive, setDragActive] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const optionsData = await getComplianceTypeOptionsRequest();
        setDocumentTypes(optionsData.documentTypes);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load document types");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleEntity = (entityId) => {
    setForm((prev) => {
      const has = prev.entityIds.includes(entityId);
      return { ...prev, entityIds: has ? prev.entityIds.filter((id) => id !== entityId) : [...prev.entityIds, entityId] };
    });
  };

  const applyFile = (file) => {
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError("File is larger than 10 MB");
      return;
    }
    setUploadError(null);
    setForm((prev) => ({ ...prev, file, docName: prev.docName || file.name.replace(/\.[^.]+$/, "") }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    applyFile(e.dataTransfer.files?.[0]);
  };

  const removeFile = () => {
    setForm((prev) => ({ ...prev, file: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file) {
      setUploadError("Choose a file first");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    try {
      await uploadDocumentRequest(form, setUploadProgress);
      navigate("/client/documents/my-documents");
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to upload document");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: 28, width: "100%" }}>
        <SkeletonBlock height={22} width={220} style={{ marginBottom: 10 }} />
        <SkeletonBlock height={13} width={280} style={{ marginBottom: 24 }} />
        <div className="upload-field-row" style={{ marginBottom: 18 }}>
          <SkeletonBlock height={38} radius={8} />
          <SkeletonBlock height={38} radius={8} />
        </div>
        <SkeletonBlock height={64} radius={8} style={{ marginBottom: 18 }} />
        <SkeletonBlock height={140} radius={10} style={{ marginBottom: 18 }} />
        <SkeletonBlock height={40} width={170} radius={8} />
      </div>
    );
  }

  const isFinalizing = uploading && uploadProgress >= 100;

  return (
    <div>
      {error && <p className="error-text">{error}</p>}

      <div className="card" style={{ padding: 28, width: "100%" }}>
        <h3 style={{ margin: "0 0 4px" }}>Upload a document</h3>
        <p className="text-muted" style={{ margin: "0 0 24px", fontSize: 13.5 }}>
          PDF, JPG, PNG or WEBP — up to 10 MB.
        </p>

        <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <input
            ref={fileInputRef}
            id="doc-file-input"
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={(e) => applyFile(e.target.files[0])}
            style={{ display: "none" }}
          />

          <div className="upload-field-row">
            <div>
              <label htmlFor="doc-name" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Document name
              </label>
              <input
                id="doc-name"
                className="input"
                placeholder="e.g. PAN Card"
                value={form.docName}
                onChange={(e) => setForm({ ...form, docName: e.target.value })}
                disabled={uploading}
                required
              />
            </div>

            <div>
              <label htmlFor="doc-type" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Document type
              </label>
              <select
                id="doc-type"
                className="input"
                value={form.docType}
                onChange={(e) => setForm({ ...form, docType: e.target.value })}
                disabled={uploading}
                required
              >
                <option value="" disabled>
                  Select type
                </option>
                {documentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="doc-remark" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Remark <span className="text-muted" style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              id="doc-remark"
              className="input"
              rows={2}
              placeholder="Anything the reviewer should know about this file"
              value={form.clientRemark}
              onChange={(e) => setForm({ ...form, clientRemark: e.target.value })}
              disabled={uploading}
            />
          </div>

          {entities.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Link to companies <span className="text-muted" style={{ fontWeight: 400 }}>(optional)</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {entities.map((entity) => (
                  <label key={entity.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={form.entityIds.includes(entity.id)}
                      onChange={() => toggleEntity(entity.id)}
                      disabled={uploading}
                    />
                    {entity.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>File</label>

            {form.file ? (
              <div className="upload-file-preview">
                <span className="upload-file-preview__icon">
                  <FileIcon />
                </span>
                <div className="upload-file-preview__meta">
                  <div className="upload-file-preview__name">{form.file.name}</div>
                  <div className="upload-file-preview__size">{formatFileSize(form.file.size)}</div>
                </div>
                {!uploading && (
                  <button type="button" className="upload-file-preview__remove" aria-label="Remove file" onClick={removeFile}>
                    <XIcon />
                  </button>
                )}
              </div>
            ) : (
              <label
                htmlFor="doc-file-input"
                className={`upload-dropzone${isDragActive ? " upload-dropzone--active" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <span className="upload-dropzone__icon">
                  <UploadCloudIcon />
                </span>
                <span className="upload-dropzone__title">Drag & drop your file here, or click to browse</span>
                <span className="upload-dropzone__hint">PDF, JPG, PNG or WEBP · up to 10 MB</span>
              </label>
            )}

            {uploading && (
              <div className="upload-progress" style={{ marginTop: 12 }}>
                {isFinalizing ? (
                  <>
                    <span className="spinner spinner--dark" aria-hidden="true" />
                    <span className="upload-progress__label">Finalizing...</span>
                  </>
                ) : (
                  <>
                    <div className="upload-progress-track">
                      <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span className="upload-progress__label">{uploadProgress}%</span>
                  </>
                )}
              </div>
            )}
          </div>

          {uploadError && <p className="error-text">{uploadError}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading}
            style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 10 }}
          >
            {uploading && <span className="spinner" aria-hidden="true" />}
            {isFinalizing ? "Finalizing..." : uploading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;
