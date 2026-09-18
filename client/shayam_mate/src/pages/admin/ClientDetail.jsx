import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getClientByIdRequest } from "../../services/adminService";
import { getDocumentDownloadUrlRequest } from "../../services/documentService";
import Avatar from "../../component/common/Avatar";
import { SkeletonBlock, SkeletonTable } from "../../component/common/Skeleton";

const STATUS_STYLES = {
  pending_ai: { background: "var(--muted)", color: "var(--muted-foreground)", label: "Pending AI" },
  pending_staff_check: { background: "var(--info)", color: "var(--info-foreground)", label: "Pending Staff Check" },
  pending_verification: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Pending Verification" },
  verified: { background: "var(--success)", color: "var(--success-foreground)", label: "Verified" },
  rejected: { background: "var(--destructive-bg)", color: "var(--destructive)", label: "Rejected" },
};

const REQUEST_STATUS_STYLES = {
  pending: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Pending" },
  approved: { background: "var(--success)", color: "var(--success-foreground)", label: "Approved" },
  rejected: { background: "var(--destructive-bg)", color: "var(--destructive)", label: "Rejected" },
};

const Badge = ({ status, styles = STATUS_STYLES, fallback = "pending_ai" }) => {
  const s = styles[status] || styles[fallback];
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

const ClientDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await getClientByIdRequest(id);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load client");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleView = async (docId) => {
    try {
      const { url } = await getDocumentDownloadUrlRequest(docId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to open document");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="card" style={{ padding: 24, marginBottom: 24, display: "flex", gap: 20, alignItems: "center" }}>
          <SkeletonBlock height={72} width={72} radius="50%" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <SkeletonBlock height={20} width={200} />
            <SkeletonBlock height={14} width={240} />
          </div>
        </div>
        <SkeletonTable columns={4} rows={2} />
        <div style={{ marginTop: 24 }}>
          <SkeletonTable columns={4} rows={2} />
        </div>
        <div style={{ marginTop: 24 }}>
          <SkeletonTable columns={5} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <p className="error-text">{error || "Client not found"}</p>
        <Link to="/admin/clients" className="btn btn-outline">
          Back to Clients
        </Link>
      </div>
    );
  }

  const { client, entities, documents, serviceRequests } = data;

  return (
    <div>
      <Link to="/admin/clients" className="text-muted" style={{ display: "inline-block", marginBottom: 16, fontSize: 14 }}>
        ← Back to Clients
      </Link>

      <div className="card" style={{ padding: 24, marginBottom: 24, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <Avatar name={client.full_name} avatarUrl={client.avatar_url} size={72} />
        <div>
          <h2 style={{ margin: 0 }}>{client.full_name}</h2>
          <p className="text-muted" style={{ margin: "4px 0 0" }}>
            {client.email}
          </p>
          <p className="text-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
            Client since {new Date(client.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h3 style={{ marginBottom: 12 }}>Entities ({entities.length})</h3>
      <div className="card" style={{ overflow: "hidden", marginBottom: 24 }}>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>GSTIN</th>
                <th style={thStyle}>Linked Since</th>
              </tr>
            </thead>
            <tbody>
              {entities.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
                    No entities linked yet.
                  </td>
                </tr>
              )}
              {entities.map((entity) => (
                <tr key={entity.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={tdStyle}>
                    <strong>{entity.name}</strong>
                  </td>
                  <td style={tdStyle}>{entity.entity_type}</td>
                  <td style={tdStyle} className="text-muted">
                    {entity.gstin || "—"}
                  </td>
                  <td style={tdStyle} className="text-muted">
                    {new Date(entity.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 style={{ marginBottom: 12 }}>Service Requests ({serviceRequests.length})</h3>
      <div className="card" style={{ overflow: "hidden", marginBottom: 24 }}>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                <th style={thStyle}>Service</th>
                <th style={thStyle}>Entity</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Requested</th>
                <th style={thStyle}>Note</th>
              </tr>
            </thead>
            <tbody>
              {serviceRequests.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
                    No service requests yet.
                  </td>
                </tr>
              )}
              {serviceRequests.map((request) => (
                <tr key={request.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={tdStyle}>
                    <strong>{request.compliance_types?.code}</strong>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {request.compliance_types?.name}
                    </div>
                  </td>
                  <td style={tdStyle} className="text-muted">
                    {request.entities?.name}
                  </td>
                  <td style={tdStyle}>
                    <Badge status={request.status} styles={REQUEST_STATUS_STYLES} fallback="pending" />
                  </td>
                  <td style={tdStyle} className="text-muted">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td style={tdStyle} className="text-muted">
                    {request.rejection_reason || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 style={{ marginBottom: 12 }}>Documents ({documents.length})</h3>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                <th style={thStyle}>Name / Type</th>
                <th style={thStyle}>Entities</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Uploaded</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
                    No documents uploaded yet.
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
                  <td style={tdStyle} className="text-muted">
                    {doc.entities.length === 0 ? "None" : doc.entities.map((e) => e.name).join(", ")}
                  </td>
                  <td style={tdStyle}>
                    <Badge status={doc.status} />
                  </td>
                  <td style={tdStyle} className="text-muted">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td style={tdStyle}>
                    <button type="button" className="btn btn-outline" onClick={() => handleView(doc.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
