import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllClientsRequest } from "../../services/adminService";
import { SkeletonTable } from "../../component/common/Skeleton";

const thStyle = { padding: "12px 16px", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 };
const tdStyle = { padding: "12px 16px" };

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllClientsRequest();
        setClients(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load clients");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2>Clients</h2>

      {loading && <SkeletonTable columns={4} />}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Joined</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
                    No clients yet.
                  </td>
                </tr>
              )}
              {clients.map((client) => (
                <tr key={client.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={tdStyle}>
                    <Link to={`/admin/clients/${client.id}`}>{client.full_name}</Link>
                  </td>
                  <td style={tdStyle}>{client.email}</td>
                  <td style={tdStyle}>{new Date(client.created_at).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <Link to={`/admin/clients/${client.id}`} className="btn btn-outline">
                      View
                    </Link>
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

export default Clients;
