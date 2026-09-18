import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import { createEntityRequestRequest, getMyEntityRequestsRequest } from "../../services/entityRequestService";

const ENTITY_TYPES = ["Pvt Ltd", "Public Ltd", "OPC", "LLP"];
const emptyForm = { name: "", entityType: "", gstin: "" };

const STATUS_STYLES = {
  pending: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Pending review" },
  approved: { background: "var(--success)", color: "var(--success-foreground)", label: "Approved" },
  rejected: { background: "var(--destructive-bg)", color: "var(--destructive)", label: "Rejected" },
};

const LinkEntityAction = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    try {
      const data = await getMyEntityRequestsRequest();
      setRequests(data);
    } catch {
      // Non-critical for this view — the form still works either way.
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    const load = async () => {
      try {
        const data = await getMyEntityRequestsRequest();
        setRequests(data);
      } catch {
        // Non-critical for this view — the form still works either way.
      }
    };
    load();
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createEntityRequestRequest(form);
      setForm(emptyForm);
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          margin: "0 16px 12px",
          padding: "6px 12px",
          background: "transparent",
          border: "1px dashed var(--sidebar-border)",
          borderRadius: "var(--radius)",
          color: "var(--sidebar-muted-foreground)",
          fontSize: 13,
          textAlign: "left",
        }}
      >
        + Link a company
      </button>

      {open && (
        <Modal title="Link a Company" onClose={() => setOpen(false)}>
          <p className="text-muted" style={{ marginTop: 0, fontSize: 13 }}>
            Submit your company's details — Shyam Mate will verify and approve it before it appears in your
            dashboard.
          </p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              className="input"
              placeholder="Company / LLP name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <select
              className="input"
              value={form.entityType}
              onChange={(e) => setForm({ ...form, entityType: e.target.value })}
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
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
            />
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for Approval"}
            </button>
          </form>

          {requests.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="text-muted" style={{ fontSize: 13, marginBottom: 8 }}>
                Your requests
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {requests.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 13,
                    }}
                  >
                    <span>
                      {r.name} <span className="text-muted">({r.entity_type})</span>
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: STATUS_STYLES[r.status].background,
                        color: STATUS_STYLES[r.status].color,
                      }}
                    >
                      {STATUS_STYLES[r.status].label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
};

export default LinkEntityAction;
