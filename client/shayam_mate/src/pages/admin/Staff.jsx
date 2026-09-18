import { useEffect, useState } from "react";
import Modal from "../../component/common/Modal";
import { SkeletonTable } from "../../component/common/Skeleton";
import { getAllStaffRequest, createStaffRequest, updateStaffRequest } from "../../services/adminService";

const emptyForm = { fullName: "", email: "", password: "" };
const thStyle = { padding: "12px 16px", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 };
const tdStyle = { padding: "12px 16px" };

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createError, setCreateError] = useState(null);
  const [creating, setCreating] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadStaff = async () => {
    try {
      const data = await getAllStaffRequest();
      setStaff(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllStaffRequest();
        setStaff(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load staff");
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
      await createStaffRequest(createForm.email, createForm.password, createForm.fullName);
      setShowCreate(false);
      setCreateForm(emptyForm);
      loadStaff();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create staff");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (member) => {
    setEditTarget(member);
    setEditForm({ fullName: member.full_name, email: member.email, password: "" });
    setEditError(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError(null);
    try {
      const updates = { fullName: editForm.fullName, email: editForm.email };
      if (editForm.password) updates.password = editForm.password;
      await updateStaffRequest(editTarget.id, updates);
      setEditTarget(null);
      loadStaff();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update staff");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Staff</h2>
        <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          Add Staff
        </button>
      </div>

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
                <th style={thStyle}>Added on</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
                    No staff yet.
                  </td>
                </tr>
              )}
              {staff.map((member) => (
                <tr key={member.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={tdStyle}>{member.full_name}</td>
                  <td style={tdStyle}>{member.email}</td>
                  <td style={tdStyle}>{new Date(member.created_at).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <button type="button" className="btn btn-outline" onClick={() => openEdit(member)}>
                      Edit
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
        <Modal title="Add Staff" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              className="input"
              placeholder="Full name"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              required
            />
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
            />
            {createError && <p className="error-text">{createError}</p>}
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? "Creating..." : "Create Staff"}
            </button>
          </form>
        </Modal>
      )}

      {editTarget && (
        <Modal title={`Edit ${editTarget.full_name}`} onClose={() => setEditTarget(null)}>
          <form onSubmit={handleEditSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              className="input"
              placeholder="Full name"
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              required
            />
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="New password (leave blank to keep current)"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
            />
            {editError && <p className="error-text">{editError}</p>}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Staff;
