import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../../component/common/Modal";
import { SkeletonTable } from "../../component/common/Skeleton";
import {
  listServiceRequestsRequest,
  approveServiceRequestRequest,
  rejectServiceRequestRequest,
} from "../../services/serviceRequestService";

const TABS = ["pending", "approved", "rejected"];
const thStyle = { padding: "12px 16px", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 };
const tdStyle = { padding: "12px 16px", verticalAlign: "top" };

const ServiceRequests = () => {
  const [status, setStatus] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [approveTarget, setApproveTarget] = useState(null);
  const [periodLabel, setPeriodLabel] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [approveError, setApproveError] = useState(null);
  const [approving, setApproving] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  const loadRequests = async (currentStatus) => {
    try {
      const data = await listServiceRequestsRequest(currentStatus);
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load service requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listServiceRequestsRequest(status);
        setRequests(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load service requests");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status]);

  const handleApprove = async (e) => {
    e.preventDefault();
    setApproving(true);
    setApproveError(null);
    try {
      await approveServiceRequestRequest(approveTarget.id, {
        periodLabel,
        dueDate: dueDate || undefined,
      });
      setApproveTarget(null);
      setPeriodLabel("");
      setDueDate("");
      loadRequests(status);
    } catch (err) {
      setApproveError(err.response?.data?.message || "Failed to approve request");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setRejecting(true);
    setRejectError(null);
    try {
      await rejectServiceRequestRequest(rejectTarget.id, rejectReason);
      setRejectTarget(null);
      setRejectReason("");
      loadRequests(status);
    } catch (err) {
      setRejectError(err.response?.data?.message || "Failed to reject request");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div>
      <h2>Service Requests</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={status === tab ? "btn btn-primary" : "btn btn-outline"}
            onClick={() => setStatus(tab)}
            style={{ textTransform: "capitalize" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && <SkeletonTable columns={5} />}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                <th style={thStyle}>Entity</th>
                <th style={thStyle}>Service</th>
                <th style={thStyle}>Requested by</th>
                <th style={thStyle}>Requested on</th>
                {status === "rejected" && <th style={thStyle}>Reason</th>}
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan={status === "rejected" ? 6 : 5} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
                    No {status} requests.
                  </td>
                </tr>
              )}
              {requests.map((request) => (
                <tr key={request.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={tdStyle}>
                    {request.entities.name}
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {request.entities.entity_type}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {request.compliance_types.code} — {request.compliance_types.name}
                  </td>
                  <td style={tdStyle}>
                    {request.requested_by_user?.full_name}
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {request.requested_by_user?.email}
                    </div>
                  </td>
                  <td style={tdStyle}>{new Date(request.created_at).toLocaleDateString()}</td>
                  {status === "rejected" && (
                    <td style={tdStyle} className="text-muted">
                      {request.rejection_reason}
                    </td>
                  )}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Link to={`/admin/service-requests/${request.id}`} className="btn btn-outline">
                        View
                      </Link>
                      {status === "pending" && (
                        <>
                          <button type="button" className="btn btn-primary" onClick={() => setApproveTarget(request)}>
                            Approve
                          </button>
                          <button type="button" className="btn btn-outline" onClick={() => setRejectTarget(request)}>
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

      {approveTarget && (
        <Modal title={`Approve ${approveTarget.compliance_types.code}`} onClose={() => setApproveTarget(null)}>
          <form onSubmit={handleApprove} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p className="text-muted" style={{ margin: 0 }}>
              This creates a compliance instance in <strong>queued</strong> stage for{" "}
              <strong>{approveTarget.entities.name}</strong>.
            </p>
            <input
              className="input"
              placeholder='Period label (e.g. "FY 2026-27")'
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              required
            />
            <input
              className="input"
              type="date"
              placeholder="Due date (optional)"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {approveError && <p className="error-text">{approveError}</p>}
            <button type="submit" className="btn btn-primary" disabled={approving}>
              {approving ? "Approving..." : "Approve & Create Compliance"}
            </button>
          </form>
        </Modal>
      )}

      {rejectTarget && (
        <Modal title={`Reject ${rejectTarget.compliance_types.code}`} onClose={() => setRejectTarget(null)}>
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
              {rejecting ? "Rejecting..." : "Reject Request"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ServiceRequests;
