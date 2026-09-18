import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDocumentsRequest, reuploadDocumentRequest, getDocumentDownloadUrlRequest } from "../../services/documentService";
import { getComplianceTypeOptionsRequest } from "../../services/complianceTypeService";
import Modal from "../../component/common/Modal";
import { SearchIcon, XIcon } from "../../component/common/icons";
import { SkeletonTable } from "../../component/common/Skeleton";

const STATUS_OPTIONS = [
  { value: "pending_ai", label: "Pending AI" },
  { value: "pending_staff_check", label: "Pending Staff Check" },
  { value: "pending_verification", label: "Pending Verification" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_STYLES = {
  pending_ai: { background: "var(--muted)", color: "var(--muted-foreground)", label: "Pending AI" },
  pending_staff_check: { background: "var(--info)", color: "var(--info-foreground)", label: "Pending staff check" },
  pending_verification: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Pending verification" },
  verified: { background: "var(--success)", color: "var(--success-foreground)", label: "Verified" },
  rejected: { background: "var(--destructive-bg)", color: "var(--destructive)", label: "Rejected" },
};

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Newest first" },
  { value: "created_at:asc", label: "Oldest first" },
  { value: "doc_name:asc", label: "Name (A–Z)" },
  { value: "doc_name:desc", label: "Name (Z–A)" },
];

const Badge = ({ status }) => {
  const s = STATUS_STYLES[status];
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: s.background,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
};

const MyDocuments = () => {
  // Filter bar state
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [docType, setDocType] = useState("");
  const [sortKey, setSortKey] = useState("created_at:desc");
  const [docTypeOptions, setDocTypeOptions] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reuploadTarget, setReuploadTarget] = useState(null);
  const [reuploadFile, setReuploadFile] = useState(null);
  const [reuploading, setReuploading] = useState(false);
  const [reuploadError, setReuploadError] = useState(null);

  const [sortBy, sortOrder] = sortKey.split(":");
  const hasActiveFilters = search || status || docType || sortKey !== "created_at:desc";

  const loadDocuments = async () => {
    try {
      const data = await getMyDocumentsRequest({ status, docType, search, sortBy, sortOrder });
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load documents");
    }
  };

  // Debounce the free-text search so every keystroke doesn't fire a request.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const load = async () => {
      try {
        const optionsData = await getComplianceTypeOptionsRequest();
        setDocTypeOptions(optionsData.documentTypes);
      } catch {
        // Non-fatal — the doc type filter just stays empty if this fails.
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyDocumentsRequest({ status, docType, search, sortBy, sortOrder });
        setDocuments(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status, docType, search, sortBy, sortOrder]);

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setDocType("");
    setSortKey("created_at:desc");
  };

  const handleReupload = async (e) => {
    e.preventDefault();
    if (!reuploadFile) {
      setReuploadError("Choose a file first");
      return;
    }
    setReuploading(true);
    setReuploadError(null);
    try {
      await reuploadDocumentRequest(reuploadTarget.id, { file: reuploadFile });
      setReuploadTarget(null);
      setReuploadFile(null);
      loadDocuments();
    } catch (err) {
      setReuploadError(err.response?.data?.message || "Failed to re-upload document");
    } finally {
      setReuploading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const { url } = await getDocumentDownloadUrlRequest(id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to open document");
    }
  };

  return (
    <div>
      <div
        className="card"
        style={{ padding: 16, marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}
      >
        <div style={{ position: "relative", flex: "1 1 260px", minWidth: 220 }}>
          <SearchIcon
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
          />
          <input
            className="input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by document or company name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: "var(--text-muted)",
                display: "flex",
                padding: 4,
              }}
            >
              <XIcon />
            </button>
          )}
        </div>

        <select className="input" style={{ width: "auto", minWidth: 170 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select className="input" style={{ width: "auto", minWidth: 180 }} value={docType} onChange={(e) => setDocType(e.target.value)}>
          <option value="">All Document Types</option>
          {docTypeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select className="input" style={{ width: "auto", minWidth: 160 }} value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button type="button" className="btn btn-outline" onClick={resetFilters}>
            Clear filters
          </button>
        )}

        <Link to="/client/documents/upload-document" className="btn btn-primary" style={{ marginLeft: "auto" }}>
          Upload Document
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <SkeletonTable columns={5} />
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontSize: 13 }}>Name</th>
                  <th style={{ padding: "12px 16px", fontSize: 13 }}>Type</th>
                  <th style={{ padding: "12px 16px", fontSize: 13 }}>Entities</th>
                  <th style={{ padding: "12px 16px", fontSize: 13 }}>Status</th>
                  <th style={{ padding: "12px 16px", fontSize: 13 }}></th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "12px 16px", textAlign: "center" }} className="text-muted">
                      {hasActiveFilters ? "No documents match these filters." : "No documents yet."}
                    </td>
                  </tr>
                )}
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                      <strong>{doc.doc_name}</strong>
                      {doc.status === "rejected" && doc.rejection_reason && (
                        <div className="error-text" style={{ marginTop: 4 }}>
                          {doc.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "top" }}>{doc.doc_type}</td>
                    <td style={{ padding: "12px 16px", verticalAlign: "top" }} className="text-muted">
                      {doc.entities.length === 0 ? "None" : doc.entities.map((e) => e.name).join(", ")}
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                      <Badge status={doc.status} />
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" className="btn btn-outline" onClick={() => handleView(doc.id)}>
                          View
                        </button>
                        {doc.status === "rejected" && (
                          <button type="button" className="btn btn-primary" onClick={() => setReuploadTarget(doc)}>
                            Re-upload
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reuploadTarget && (
        <Modal title={`Re-upload ${reuploadTarget.doc_name}`} onClose={() => setReuploadTarget(null)}>
          <form onSubmit={handleReupload} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p className="text-muted" style={{ marginTop: 0, fontSize: 13 }}>
              This creates a new version. The rejected copy stays in your history.
            </p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setReuploadFile(e.target.files[0])}
              required
            />
            {reuploadError && <p className="error-text">{reuploadError}</p>}
            <button type="submit" className="btn btn-primary" disabled={reuploading}>
              {reuploading ? "Uploading..." : "Re-upload"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MyDocuments;
