import { useEffect, useState } from "react";
import { listLeadsRequest, updateLeadStatusRequest } from "../../services/leadService";
import { SkeletonTable } from "../../component/common/Skeleton";

const TABS = ["all", "new", "contacted", "closed"];
const STATUSES = ["new", "contacted", "closed"];

const thStyle = { padding: "12px 16px", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 };
const tdStyle = { padding: "12px 16px", verticalAlign: "top" };

const statusBadgeStyle = (status) => {
  const map = {
    new: { background: "var(--info)", color: "var(--info-foreground)" },
    contacted: { background: "var(--warning)", color: "var(--warning-foreground)" },
    closed: { background: "var(--success)", color: "var(--success-foreground)" },
  };
  return {
    ...map[status],
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  };
};

const Leads = () => {
  const [tab, setTab] = useState("all");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await listLeadsRequest(tab === "all" ? undefined : tab);
        setLeads(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load leads");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateLeadStatusRequest(id, status);
      setLeads((prev) =>
        tab === "all"
          ? prev.map((lead) => (lead.id === id ? { ...lead, status } : lead))
          : prev.filter((lead) => lead.id !== id)
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update lead status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h2>Leads</h2>
      <p className="text-muted" style={{ marginTop: -8 }}>
        Enquiries submitted through the website&apos;s &quot;Get in Touch&quot; form.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "btn btn-primary" : "btn btn-outline"}
            onClick={() => setTab(t)}
            style={{ textTransform: "capitalize" }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <SkeletonTable columns={6} />}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Contact</th>
                  <th style={thStyle}>Message</th>
                  <th style={thStyle}>Received</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
                      No leads yet.
                    </td>
                  </tr>
                )}
                {leads.map((lead) => (
                  <tr key={lead.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={tdStyle}>{lead.name}</td>
                    <td style={tdStyle}>
                      {lead.email}
                      {lead.phone && (
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {lead.phone}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 320 }}>{lead.message}</td>
                    <td style={tdStyle}>{new Date(lead.created_at).toLocaleString()}</td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(lead.status)}>{lead.status}</span>
                    </td>
                    <td style={tdStyle}>
                      <select
                        className="input"
                        style={{ width: "auto" }}
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
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

export default Leads;
