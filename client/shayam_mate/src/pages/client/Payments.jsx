import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { getMyInvoicesRequest } from "../../services/invoiceService";
import { createPaymentOrderRequest, verifyPaymentRequest } from "../../services/paymentService";
import { loadRazorpayScript } from "../../utils/loadRazorpayScript";
import { SkeletonTable } from "../../component/common/Skeleton";

const STATUS_STYLES = {
  unpaid: { background: "var(--warning)", color: "var(--warning-foreground)", label: "Unpaid" },
  paid: { background: "var(--success)", color: "var(--success-foreground)", label: "Paid" },
};

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

const thStyle = { padding: "12px 16px", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 };
const tdStyle = { padding: "12px 16px", verticalAlign: "top" };

const Payments = () => {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingId, setPayingId] = useState(null);

  const loadInvoices = async () => {
    try {
      const data = await getMyInvoicesRequest();
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load invoices");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyInvoicesRequest();
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

  const handlePay = async (invoice) => {
    setPayingId(invoice.id);
    setError(null);
    try {
      const order = await createPaymentOrderRequest(invoice.id);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load the payment gateway. Please check your connection and try again.");
        setPayingId(null);
        return;
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Shyam Mate",
        description: `Invoice ${order.invoiceNumber}`,
        prefill: { name: user?.full_name, email: user?.email },
        theme: { color: "#14345c" },
        handler: async (response) => {
          try {
            await verifyPaymentRequest(invoice.id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await loadInvoices();
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed");
          } finally {
            setPayingId(null);
          }
        },
        modal: {
          ondismiss: () => setPayingId(null),
        },
      });

      checkout.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setPayingId(null);
      });

      checkout.open();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start payment");
      setPayingId(null);
    }
  };

  return (
    <div>
      <h2>Payments</h2>
      <p className="text-muted" style={{ marginTop: -8 }}>
        Every invoice raised against your companies.
      </p>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <SkeletonTable columns={5} />
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
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
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
                      <Badge status={invoice.status} />
                    </td>
                    <td style={tdStyle}>
                      {invoice.status === "unpaid" && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={payingId === invoice.id}
                          onClick={() => handlePay(invoice)}
                        >
                          {payingId === invoice.id ? "Processing..." : "Pay Now"}
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

export default Payments;
