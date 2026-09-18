import { useEffect, useState } from "react";
import { useEntityStore } from "../../store/entityStore";
import {
  getAvailableServicesRequest,
  createServiceRequestRequest,
  getMyServiceRequestsRequest,
} from "../../services/serviceRequestService";
import { SkeletonCards } from "../../component/common/Skeleton";

const STATUS_STYLES = {
  available: { background: "var(--muted)", color: "var(--muted-foreground)", label: "Available" },
  pending: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Requested — pending approval" },
  enrolled: { background: "var(--success)", color: "var(--success-foreground)", label: "Enrolled" },
};

const REQUEST_STATUS_STYLES = {
  pending: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Pending" },
  approved: { background: "var(--success)", color: "var(--success-foreground)", label: "Approved" },
  rejected: { background: "var(--destructive-bg)", color: "var(--destructive)", label: "Rejected" },
};

const INVOICE_STATUS_STYLES = {
  unpaid: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Unpaid" },
  paid: { background: "var(--success)", color: "var(--success-foreground)", label: "Paid" },
};

const Badge = ({ style, children }) => (
  <span
    style={{
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: style.background,
      color: style.color,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const Compliance = () => {
  const { entities, selectedEntityId, isLoading: entitiesLoading } = useEntityStore();

  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestingId, setRequestingId] = useState(null);

  useEffect(() => {
    if (!selectedEntityId) {
      return;
    }

    const load = async () => {
      try {
        const [servicesData, requestsData] = await Promise.all([
          getAvailableServicesRequest(selectedEntityId),
          getMyServiceRequestsRequest(selectedEntityId),
        ]);
        setServices(servicesData);
        setRequests(requestsData);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load compliance services");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedEntityId]);

  const handleRequest = async (complianceTypeId) => {
    setRequestingId(complianceTypeId);
    try {
      await createServiceRequestRequest(selectedEntityId, complianceTypeId);
      const [servicesData, requestsData] = await Promise.all([
        getAvailableServicesRequest(selectedEntityId),
        getMyServiceRequestsRequest(selectedEntityId),
      ]);
      setServices(servicesData);
      setRequests(requestsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request service");
    } finally {
      setRequestingId(null);
    }
  };

  if (entitiesLoading) {
    return <SkeletonCards count={3} />;
  }

  if (entities.length === 0) {
    return (
      <div>
        <h2>Compliance</h2>
        <p className="text-muted">
          No company is linked to your account yet. Contact Shyam Mate to get your entity set up.
        </p>
      </div>
    );
  }

  if (loading) {
    return <SkeletonCards count={3} />;
  }

  return (
    <div>
      <h2>Compliance Services</h2>
      {error && <p className="error-text">{error}</p>}

      <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
        {services.length === 0 && (
          <p className="text-muted">No services available for this entity type yet.</p>
        )}
        {services.map((service) => {
          const statusStyle = STATUS_STYLES[service.status];
          return (
            <div key={service.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <strong>{service.code}</strong>
                    <Badge style={statusStyle}>{statusStyle.label}</Badge>
                  </div>
                  <div style={{ fontWeight: 600, marginTop: 4 }}>{service.name}</div>
                  {service.description && (
                    <p className="text-muted" style={{ marginTop: 6, marginBottom: 0 }}>
                      {service.description}
                    </p>
                  )}
                  {service.due_rule_text && (
                    <p className="text-muted" style={{ marginTop: 6, marginBottom: 0, fontSize: 13 }}>
                      Due: {service.due_rule_text} · {service.periodicity}
                    </p>
                  )}
                  <p style={{ marginTop: 6, marginBottom: 0, fontSize: 13 }}>
                    Professional fee: ₹{service.default_professional_fee} + Govt fee: ₹{service.default_govt_fee}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={service.status !== "available" || requestingId === service.id}
                  onClick={() => handleRequest(service.id)}
                  style={{ flexShrink: 0 }}
                >
                  {requestingId === service.id
                    ? "Requesting..."
                    : service.status === "available"
                      ? "Request this service"
                      : statusStyle.label}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h3>My Requests</h3>
      {requests.length === 0 ? (
        <p className="text-muted">No requests yet.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                <th style={{ padding: "10px 16px", fontSize: 13 }}>Service</th>
                <th style={{ padding: "10px 16px", fontSize: 13 }}>Requested on</th>
                <th style={{ padding: "10px 16px", fontSize: 13 }}>Status</th>
                <th style={{ padding: "10px 16px", fontSize: 13 }}>Invoice</th>
                <th style={{ padding: "10px 16px", fontSize: 13 }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 16px" }}>
                    {request.compliance_types.code} — {request.compliance_types.name}
                  </td>
                  <td style={{ padding: "10px 16px" }}>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <Badge style={REQUEST_STATUS_STYLES[request.status]}>
                      {REQUEST_STATUS_STYLES[request.status].label}
                    </Badge>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    {request.invoice ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <strong>₹{request.invoice.total_amount}</strong>
                        <Badge style={INVOICE_STATUS_STYLES[request.invoice.status]}>
                          {INVOICE_STATUS_STYLES[request.invoice.status].label}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 16px" }} className="text-muted">
                    {request.rejection_reason || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}
    </div>
  );
};

export default Compliance;
