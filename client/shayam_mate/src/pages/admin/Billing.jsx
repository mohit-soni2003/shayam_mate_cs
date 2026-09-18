import { useEffect, useState } from "react";
import { getAllInvoicesRequest, markInvoicePaidRequest } from "../../services/invoiceService";
import { SkeletonTable } from "../../component/common/Skeleton";

const STATUS_STYLES = {
  unpaid: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Unpaid" },
  paid: { background: "var(--success)", color: "var(--success-foreground)", label: "Paid" },
};

const TRANSACTION_STATUS_STYLES = {
  created: { background: "var(--muted)", color: "var(--muted-foreground)", label: "Awaiting payment" },
  paid: { background: "var(--success)", color: "var(--success-foreground)", label: "Paid via Razorpay" },
  failed: { background: "var(--destructive-bg)", color: "var(--destructive)", label: "Payment failed" },
};

const Badge = ({ styles, status }) => {
  const s = styles[status];
  if (!s) return null;
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

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const loadInvoices = async () => {
    try {
      const data = await getAllInvoicesRequest();
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load invoices");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllInvoicesRequest();
        setInvoices(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMarkPaid = async (id) => {
    setMarkingId(id);
    try {
      await markInvoicePaidRequest(id);
      await loadInvoices();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update invoice");
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div>
      <h2>Billing</h2>
      <p className="text-muted" style={{ marginTop: -8 }}>
        Every invoice raised across all clients, and its payment status.
      </p>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <SkeletonTable columns={6} />
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                  <th style={thStyle}>Invoice</th>
                  <th style={thStyle}>Entity</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Payment</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
                      No invoices yet.
                    </td>
                  </tr>
                )}
                {invoices.map((invoice) => (
                  <tr key={invoice.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={tdStyle}>
                      <strong>{invoice.invoice_number}</strong>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={tdStyle} className="text-muted">
                      {invoice.entities?.name}
                    </td>
                    <td style={tdStyle}>₹{invoice.total_amount}</td>
                    <td style={tdStyle}>
                      <Badge styles={STATUS_STYLES} status={invoice.status} />
                    </td>
                    <td style={tdStyle} className="text-muted">
                      {invoice.latest_transaction ? (
                        <Badge styles={TRANSACTION_STATUS_STYLES} status={invoice.latest_transaction.status} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={tdStyle}>
                      {invoice.status === "unpaid" && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={markingId === invoice.id}
                          onClick={() => handleMarkPaid(invoice.id)}
                        >
                          {markingId === invoice.id ? "Updating..." : "Mark as Paid"}
                        </button>
                      )}
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

export default Billing;
