import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import Modal from "../../component/common/Modal";
import { SearchIcon, XIcon } from "../../component/common/icons";
import { SkeletonTable } from "../../component/common/Skeleton";
import {
  getAllDocumentsRequest,
  getDocumentDownloadUrlRequest,
  staffReviewDocumentRequest,
  verifyDocumentRequest,
  rejectDocumentRequest,
  attachEntityToDocumentRequest,
} from "../../services/documentService";
import { getAllEntitiesRequest } from "../../services/entityService";
import { getComplianceTypeOptionsRequest } from "../../services/complianceTypeService";

const STATUS_OPTIONS = [
  { value: "pending_ai", label: "Pending AI" },
  { value: "pending_staff_check", label: "Pending Staff Check" },
  { value: "pending_verification", label: "Pending Verification" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_STYLES = {
  pending_ai: { background: "var(--muted)", color: "var(--muted-foreground)", label: "Pending AI" },
  pending_staff_check: { background: "var(--info)", color: "var(--info-foreground)", label: "Pending Staff Check" },
  pending_verification: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Pending Verification" },
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
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending_ai;
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

const thStyle = { padding: "12px 16px", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 };
const tdStyle = { padding: "12px 16px", verticalAlign: "top" };

const Documents = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  // Filter bar state
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [docType, setDocType] = useState("");
  const [sortKey, setSortKey] = useState("created_at:desc");
  const [docTypeOptions, setDocTypeOptions] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [staffTarget, setStaffTarget] = useState(null);
  const [staffRemark, setStaffRemark] = useState("");
  const [staffSaving, setStaffSaving] = useState(false);
  const [staffError, setStaffError] = useState(null);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState(null);

  const [linkTarget, setLinkTarget] = useState(null);
  const [linkEntityId, setLinkEntityId] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState(null);

  const [verifyingId, setVerifyingId] = useState(null);

  const [sortBy, sortOrder] = sortKey.split(":");
  const hasActiveFilters = search || status || docType || sortKey !== "created_at:desc";

  const loadDocuments = async () => {
    try {
      const data = await getAllDocumentsRequest({ status, docType, search, sortBy, sortOrder });
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
        const [entitiesData, optionsData] = await Promise.all([getAllEntitiesRequest(), getComplianceTypeOptionsRequest()]);
        setEntities(entitiesData);
        setDocTypeOptions(optionsData.documentTypes);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load filters");
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAllDocumentsRequest({ status, docType, search, sortBy, sortOrder });
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

  const handleView = async (id) => {
    try {
      const { url } = await getDocumentDownloadUrlRequest(id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to open document");
    }
  };

  const handleStaffReview = async (e) => {
    e.preventDefault();
    setStaffSaving(true);
    setStaffError(null);
    try {
      await staffReviewDocumentRequest(staffTarget.id, staffRemark);
      setStaffTarget(null);
      setStaffRemark("");
      loadDocuments();
    } catch (err) {
      setStaffError(err.response?.data?.message || "Failed to save review");
    } finally {
      setStaffSaving(false);
    }
  };

  const handleVerify = async (id) => {
    setVerifyingId(id);
    try {
      await verifyDocumentRequest(id);
      loadDocuments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify document");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setRejecting(true);
    setRejectError(null);
    try {
      await rejectDocumentRequest(rejectTarget.id, rejectReason);
      setRejectTarget(null);
      setRejectReason("");
      loadDocuments();
    } catch (err) {
      setRejectError(err.response?.data?.message || "Failed to reject document");
    } finally {
      setRejecting(false);
    }
  };

  const handleLinkEntity = async (e) => {
    e.preventDefault();
    if (!linkEntityId) return;
    setLinking(true);
    setLinkError(null);
    try {
      await attachEntityToDocumentRequest(linkTarget.id, linkEntityId);
      setLinkTarget(null);
      setLinkEntityId("");
      loadDocuments();
    } catch (err) {
      setLinkError(err.response?.data?.message || "Failed to link entity");
    } finally {
      setLinking(false);
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
            placeholder="Search by document, entity, or uploader..."
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
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <SkeletonTable columns={6} />
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                  <th style={thStyle}>Name / Type</th>
                  <th style={thStyle}>Uploaded by</th>
                  <th style={thStyle}>Entities</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Remarks</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
                      {hasActiveFilters ? "No documents match these filters." : "No documents here."}
                    </td>
                  </tr>
                )}
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={tdStyle}>
                      <strong>{doc.doc_name}</strong>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {doc.doc_type}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {doc.uploaded_by_user?.full_name}
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {doc.uploaded_by_user?.role}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {doc.entities.length === 0 ? <span className="text-muted">None</span> : doc.entities.map((e) => e.name).join(", ")}
                      <div>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ marginTop: 6, padding: "2px 8px", fontSize: 12 }}
                          onClick={() => setLinkTarget(doc)}
                        >
                          + Link entity
                        </button>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <Badge status={doc.status} />
                    </td>
                    <td style={tdStyle} className="text-muted">
                      {doc.ai_remark && (
                        <div>
                          AI{doc.ai_confidence != null ? ` (${doc.ai_confidence}%)` : ""}: {doc.ai_remark}
                        </div>
                      )}
                      {doc.client_remark && <div>Client: {doc.client_remark}</div>}
                      {doc.staff_remark && <div>Staff: {doc.staff_remark}</div>}
                      {doc.rejection_reason && <div className="error-text">Reason: {doc.rejection_reason}</div>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <button type="button" className="btn btn-outline" onClick={() => handleView(doc.id)}>
                          View
                        </button>
                        {doc.status === "pending_staff_check" && (
                          <button type="button" className="btn btn-outline" onClick={() => setStaffTarget(doc)}>
                            Add staff remark
                          </button>
                        )}
                        {isAdmin && (doc.status === "pending_staff_check" || doc.status === "pending_verification") && (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={verifyingId === doc.id}
                              onClick={() => handleVerify(doc.id)}
                            >
                              {verifyingId === doc.id ? "Verifying..." : "Verify"}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setRejectTarget(doc)}>
                              Reject
                            </button>
                          </>
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

      {staffTarget && (
        <Modal title={`Staff Review — ${staffTarget.doc_name}`} onClose={() => setStaffTarget(null)}>
          <form onSubmit={handleStaffReview} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea
              className="input"
              rows={3}
              placeholder="Does the file match what it claims to be? Anything obviously wrong?"
              value={staffRemark}
              onChange={(e) => setStaffRemark(e.target.value)}
              required
            />
            {staffError && <p className="error-text">{staffError}</p>}
            <button type="submit" className="btn btn-primary" disabled={staffSaving}>
              {staffSaving ? "Saving..." : "Save Review"}
            </button>
          </form>
        </Modal>
      )}

      {rejectTarget && (
        <Modal title={`Reject ${rejectTarget.doc_name}`} onClose={() => setRejectTarget(null)}>
          <form onSubmit={handleReject} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea
              className="input"
              rows={3}
              placeholder="Reason (shown to the client)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
            {rejectError && <p className="error-text">{rejectError}</p>}
            <button type="submit" className="btn btn-primary" disabled={rejecting}>
              {rejecting ? "Rejecting..." : "Reject Document"}
            </button>
          </form>
        </Modal>
      )}

      {linkTarget && (
        <Modal title={`Link entity to ${linkTarget.doc_name}`} onClose={() => setLinkTarget(null)}>
          <form onSubmit={handleLinkEntity} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <select className="input" value={linkEntityId} onChange={(e) => setLinkEntityId(e.target.value)} required>
              <option value="" disabled>
                Select an entity
              </option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.entity_type})
                </option>
              ))}
            </select>
            {linkError && <p className="error-text">{linkError}</p>}
            <button type="submit" className="btn btn-primary" disabled={linking}>
              {linking ? "Linking..." : "Link Entity"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Documents;
