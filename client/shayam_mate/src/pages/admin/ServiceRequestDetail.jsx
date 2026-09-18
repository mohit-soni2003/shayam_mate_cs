import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getServiceRequestByIdRequest } from "../../services/serviceRequestService";
import { createInvoiceRequest, markInvoicePaidRequest } from "../../services/invoiceService";
import { SkeletonBlock } from "../../component/common/Skeleton";

const REQUEST_STATUS_STYLES = {
  pending: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Pending" },
  approved: { background: "var(--success)", color: "var(--success-foreground)", label: "Approved" },
  rejected: { background: "var(--destructive-bg)", color: "var(--destructive)", label: "Rejected" },
};

const INVOICE_STATUS_STYLES = {
  unpaid: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Unpaid" },
  paid: { background: "var(--success)", color: "var(--success-foreground)", label: "Paid" },
};

const Badge = ({ status, styles }) => {
  const s = styles[status];
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

const Field = ({ label, children }) => (
  <div>
    <div className="text-muted" style={{ fontSize: 12, marginBottom: 3 }}>
      {label}
    </div>
    <div>{children ?? "—"}</div>
  </div>
);

const ServiceRequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [invoiceForm, setInvoiceForm] = useState({ professionalFee: "", govtFee: "", notes: "" });
  const [creating, setCreating] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  const load = async () => {
    try {
      const data = await getServiceRequestByIdRequest(id);
      setRequest(data);
      setError(null);
      if (data.compliance && !data.invoice) {
        setInvoiceForm({
          professionalFee: data.compliance.professional_fee ?? "",
          govtFee: data.compliance.govt_fee ?? "",
          notes: "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load service request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadOnMount = async () => {
      try {
        const data = await getServiceRequestByIdRequest(id);
        setRequest(data);
        setError(null);
        if (data.compliance && !data.invoice) {
          setInvoiceForm({
            professionalFee: data.compliance.professional_fee ?? "",
            govtFee: data.compliance.govt_fee ?? "",
            notes: "",
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load service request");
      } finally {
        setLoading(false);
      }
    };
    loadOnMount();
  }, [id]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setCreating(true);
    setInvoiceError(null);
    try {
      await createInvoiceRequest(id, {
        professionalFee: Number(invoiceForm.professionalFee) || 0,
        govtFee: Number(invoiceForm.govtFee) || 0,
        notes: invoiceForm.notes || undefined,
      });
      await load();
    } catch (err) {
      setInvoiceError(err.response?.data?.message || "Failed to create invoice");
    } finally {
      setCreating(false);
    }
  };

  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    try {
      await markInvoicePaidRequest(request.invoice.id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update invoice");
    } finally {
      setMarkingPaid(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <SkeletonBlock height={22} width={240} />
        <SkeletonBlock height={14} width={320} />
        <SkeletonBlock height={120} radius={10} />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div>
        <p className="error-text">{error || "Service request not found"}</p>
        <Link to="/admin/service-requests" className="btn btn-outline">
          Back to Service Requests
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/admin/service-requests"
        className="text-muted"
        style={{ display: "inline-block", marginBottom: 16, fontSize: 14 }}
      >
        ← Back to Service Requests
      </Link>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>
              {request.compliance_types.code} — {request.compliance_types.name}
            </h2>
            {request.compliance_types.description && (
              <p className="text-muted" style={{ marginTop: 6, marginBottom: 0 }}>
                {request.compliance_types.description}
              </p>
            )}
          </div>
          <Badge status={request.status} styles={REQUEST_STATUS_STYLES} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}
        >
          <Field label="Entity">
            {request.entities.name} ({request.entities.entity_type})
          </Field>
          <Field label="Requested by">
            {request.requested_by_user?.full_name}
            <div className="text-muted" style={{ fontSize: 12 }}>
              {request.requested_by_user?.email}
            </div>
          </Field>
          <Field label="Requested on">{new Date(request.created_at).toLocaleDateString()}</Field>
          <Field label="Periodicity">{request.compliance_types.periodicity}</Field>
          {request.compliance_types.due_rule_text && <Field label="Due rule">{request.compliance_types.due_rule_text}</Field>}
          {request.reviewed_by_user && (
            <Field label={request.status === "approved" ? "Approved by" : "Reviewed by"}>
              {request.reviewed_by_user.full_name}
              <div className="text-muted" style={{ fontSize: 12 }}>
                {request.reviewed_at && new Date(request.reviewed_at).toLocaleDateString()}
              </div>
            </Field>
          )}
        </div>

        {request.status === "rejected" && request.rejection_reason && (
          <p className="error-text" style={{ marginTop: 20, marginBottom: 0 }}>
            Rejection reason: {request.rejection_reason}
          </p>
        )}
      </div>

      {request.compliance && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Compliance Instance</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
            }}
          >
            <Field label="Period">{request.compliance.period_label}</Field>
            <Field label="Stage">{request.compliance.stage}</Field>
            <Field label="Due date">
              {request.compliance.due_date ? new Date(request.compliance.due_date).toLocaleDateString() : "—"}
            </Field>
            <Field label="Professional fee">₹{request.compliance.professional_fee}</Field>
            <Field label="Govt fee">₹{request.compliance.govt_fee}</Field>
          </div>
        </div>
      )}

      {request.status === "approved" && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Invoice</h3>

          {request.invoice ? (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <Field label="Invoice #">{request.invoice.invoice_number}</Field>
                <Field label="Professional fee">₹{request.invoice.professional_fee}</Field>
                <Field label="Govt fee">₹{request.invoice.govt_fee}</Field>
                <Field label="Total">
                  <strong>₹{request.invoice.total_amount}</strong>
                </Field>
                <Field label="Status">
                  <Badge status={request.invoice.status} styles={INVOICE_STATUS_STYLES} />
                </Field>
                <Field label="Created">{new Date(request.invoice.created_at).toLocaleDateString()}</Field>
              </div>
              {request.invoice.notes && <Field label="Notes">{request.invoice.notes}</Field>}

              {request.invoice.status === "unpaid" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 16 }}
                  disabled={markingPaid}
                  onClick={handleMarkPaid}
                >
                  {markingPaid ? "Updating..." : "Mark as Paid"}
                </button>
              )}

              <p className="text-muted" style={{ marginTop: 16, marginBottom: 0, fontSize: 13 }}>
                The client can see this invoice under their compliance service request.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateInvoice} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
              <p className="text-muted" style={{ marginTop: 0, marginBottom: 0, fontSize: 13.5 }}>
                No invoice has been created yet. Once created, the client will see it against this service request.
              </p>
              <div className="upload-field-row">
                <div>
                  <label htmlFor="professional-fee" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Professional fee (₹)
                  </label>
                  <input
                    id="professional-fee"
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoiceForm.professionalFee}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, professionalFee: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="govt-fee" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Govt fee (₹)
                  </label>
                  <input
                    id="govt-fee"
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoiceForm.govtFee}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, govtFee: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="invoice-notes" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Notes <span className="text-muted" style={{ fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  id="invoice-notes"
                  className="input"
                  rows={2}
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                />
              </div>
              {invoiceError && <p className="error-text">{invoiceError}</p>}
              <button type="submit" className="btn btn-primary" disabled={creating} style={{ alignSelf: "flex-start" }}>
                {creating ? "Creating..." : "Create Invoice"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceRequestDetail;
