import { useEffect, useState } from "react";
import Modal from "../../component/common/Modal";
import { SkeletonTable } from "../../component/common/Skeleton";
import { getAllEntitiesRequest, createEntityRequest, assignClientToEntityRequest } from "../../services/entityService";
import { getAllClientsRequest } from "../../services/adminService";
import {
  listEntityRequestsRequest,
  approveEntityRequestRequest,
  rejectEntityRequestRequest,
} from "../../services/entityRequestService";

const ENTITY_TYPES = ["Pvt Ltd", "Public Ltd", "OPC", "LLP"];
const emptyForm = { name: "", entityType: "", gstin: "", clientUserId: "" };
const thStyle = { padding: "12px 16px", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 };
const tdStyle = { padding: "12px 16px", verticalAlign: "top" };

const Entities = () => {
  const [entities, setEntities] = useState([]);
  const [clients, setClients] = useState([]);
  const [entityRequests, setEntityRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createError, setCreateError] = useState(null);
  const [creating, setCreating] = useState(false);

  const [addClientTarget, setAddClientTarget] = useState(null);
  const [addClientUserId, setAddClientUserId] = useState("");
  const [addClientError, setAddClientError] = useState(null);
  const [addingClient, setAddingClient] = useState(false);

  const [approvingId, setApprovingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  const loadEntities = async () => {
    try {
      const data = await getAllEntitiesRequest();
      setEntities(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load entities");
    }
  };

  const loadEntityRequests = async () => {
    try {
      const data = await listEntityRequestsRequest("pending");
      setEntityRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load entity requests");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [entitiesData, clientsData, requestsData] = await Promise.all([
          getAllEntitiesRequest(),
          getAllClientsRequest(),
          listEntityRequestsRequest("pending"),
        ]);
        setEntities(entitiesData);
        setClients(clientsData);
        setEntityRequests(requestsData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load entities");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      await createEntityRequest({
        name: createForm.name,
        entityType: createForm.entityType,
        gstin: createForm.gstin || undefined,
        clientUserId: createForm.clientUserId || undefined,
      });
      setShowCreate(false);
      setCreateForm(emptyForm);
      loadEntities();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create entity");
    } finally {
      setCreating(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!addClientUserId) return;
    setAddingClient(true);
    setAddClientError(null);
    try {
      await assignClientToEntityRequest(addClientTarget.id, addClientUserId);
      setAddClientTarget(null);
      setAddClientUserId("");
      loadEntities();
    } catch (err) {
      setAddClientError(err.response?.data?.message || "Failed to map client");
    } finally {
      setAddingClient(false);
    }
  };

  const handleApproveRequest = async (id) => {
    setApprovingId(id);
    try {
      await approveEntityRequestRequest(id);
      loadEntityRequests();
      loadEntities();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve request");
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectRequest = async (e) => {
    e.preventDefault();
    setRejecting(true);
    setRejectError(null);
    try {
      await rejectEntityRequestRequest(rejectTarget.id, rejectReason);
      setRejectTarget(null);
      setRejectReason("");
      loadEntityRequests();
    } catch (err) {
      setRejectError(err.response?.data?.message || "Failed to reject request");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Entities</h2>
        <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          Add Entity
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {!loading && entityRequests.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 20, borderColor: "var(--warning-border)" }}>
          <h3 style={{ marginTop: 0 }}>Pending Company Requests</h3>
          {entityRequests.map((request) => (
            <div
              key={request.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div>
                <strong>{request.name}</strong> · {request.entity_type}
                {request.gstin && <span className="text-muted"> · GSTIN {request.gstin}</span>}
                <div className="text-muted" style={{ fontSize: 13 }}>
                  Requested by {request.requested_by_user?.full_name} ({request.requested_by_user?.email})
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={approvingId === request.id}
                  onClick={() => handleApproveRequest(request.id)}
                >
                  {approvingId === request.id ? "Approving..." : "Approve"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setRejectTarget(request)}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && <SkeletonTable columns={4} />}

      {!loading && (
        <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Mapped clients</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {entities.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
                    No entities yet.
                  </td>
                </tr>
              )}
              {entities.map((entity) => (
                <tr key={entity.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={tdStyle}>
                    <strong>{entity.name}</strong>
                  </td>
                  <td style={tdStyle}>{entity.entity_type}</td>
                  <td style={tdStyle}>
                    {entity.clients.length === 0 ? (
                      <span className="text-muted">None</span>
                    ) : (
                      entity.clients.map((c) => c.full_name).join(", ")
                    )}
                  </td>
                  <td style={tdStyle}>
                    <button type="button" className="btn btn-outline" onClick={() => setAddClientTarget(entity)}>
                      Add Client
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {showCreate && (
        <Modal title="Add Entity" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              className="input"
              placeholder="Entity name (e.g. Kalpataru Infra Pvt Ltd)"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
            />
            <select
              className="input"
              value={createForm.entityType}
              onChange={(e) => setCreateForm({ ...createForm, entityType: e.target.value })}
              required
            >
              <option value="" disabled>
                Entity type
              </option>
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="GSTIN (optional)"
              value={createForm.gstin}
              onChange={(e) => setCreateForm({ ...createForm, gstin: e.target.value })}
            />
            <select
              className="input"
              value={createForm.clientUserId}
              onChange={(e) => setCreateForm({ ...createForm, clientUserId: e.target.value })}
            >
              <option value="">Link a client now (optional)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
            {createError && <p className="error-text">{createError}</p>}
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? "Creating..." : "Create Entity"}
            </button>
          </form>
        </Modal>
      )}

      {addClientTarget && (
        <Modal title={`Add client to ${addClientTarget.name}`} onClose={() => setAddClientTarget(null)}>
          <form onSubmit={handleAddClient} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <select
              className="input"
              value={addClientUserId}
              onChange={(e) => setAddClientUserId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a client
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
            {addClientError && <p className="error-text">{addClientError}</p>}
            <button type="submit" className="btn btn-primary" disabled={addingClient}>
              {addingClient ? "Adding..." : "Add Client"}
            </button>
          </form>
        </Modal>
      )}

      {rejectTarget && (
        <Modal title={`Reject ${rejectTarget.name}`} onClose={() => setRejectTarget(null)}>
          <form onSubmit={handleRejectRequest} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

export default Entities;
