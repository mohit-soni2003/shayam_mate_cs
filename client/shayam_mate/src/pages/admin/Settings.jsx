import { useEffect, useState } from "react";
import Modal from "../../component/common/Modal";
import { SkeletonTable } from "../../component/common/Skeleton";
import { getAllDocTypesRequest, createDocTypeRequest, updateDocTypeRequest } from "../../services/docTypeService";

const thStyle = { padding: "12px 16px", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 };
const tdStyle = { padding: "12px 16px", verticalAlign: "top" };

const DocTypesPanel = () => {
  const [docTypes, setDocTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState(null);

  const [togglingId, setTogglingId] = useState(null);

  const loadDocTypes = async () => {
    try {
      const data = await getAllDocTypesRequest();
      setDocTypes(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load document types");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllDocTypesRequest();
        setDocTypes(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load document types");
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
      await createDocTypeRequest(newName);
      setNewName("");
      loadDocTypes();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create document type");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (docType) => {
    setTogglingId(docType.id);
    try {
      await updateDocTypeRequest(docType.id, { isActive: !docType.is_active });
      loadDocTypes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update document type");
    } finally {
      setTogglingId(null);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    setRenaming(true);
    setRenameError(null);
    try {
      await updateDocTypeRequest(renameTarget.id, { name: renameValue });
      setRenameTarget(null);
      setRenameValue("");
      loadDocTypes();
    } catch (err) {
      setRenameError(err.response?.data?.message || "Failed to rename document type");
    } finally {
      setRenaming(false);
    }
  };

  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ marginTop: 0 }}>Document Types</h3>
      <p className="text-muted" style={{ fontSize: 13, marginTop: -8 }}>
        These populate the document type dropdown clients see when uploading, and the "required documents"
        checklist in the Compliance Catalog. Deactivating hides a type from new selections — documents already
        using it are unaffected.
      </p>

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          className="input"
          placeholder="New document type (e.g. Rent Deed)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={creating} style={{ flexShrink: 0 }}>
          {creating ? "Adding..." : "Add"}
        </button>
      </form>
      {createError && <p className="error-text">{createError}</p>}

      {loading && <SkeletonTable columns={3} />}
      {error && <p className="error-text">{error}</p>}

      {!loading && (
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {docTypes.map((docType) => (
                <tr key={docType.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={tdStyle}>{docType.name}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: docType.is_active ? "var(--success)" : "var(--muted)",
                        color: docType.is_active ? "var(--success-foreground)" : "var(--muted-foreground)",
                      }}
                    >
                      {docType.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          setRenameTarget(docType);
                          setRenameValue(docType.name);
                        }}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={togglingId === docType.id}
                        onClick={() => handleToggleActive(docType)}
                      >
                        {docType.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {renameTarget && (
        <Modal title={`Rename "${renameTarget.name}"`} onClose={() => setRenameTarget(null)}>
          <form onSubmit={handleRename} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              className="input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              required
            />
            <p className="text-muted" style={{ fontSize: 12, margin: 0 }}>
              Existing documents and catalog entries keep the old name — only new selections use the new one.
            </p>
            {renameError && <p className="error-text">{renameError}</p>}
            <button type="submit" className="btn btn-primary" disabled={renaming}>
              {renaming ? "Saving..." : "Save"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

const Settings = () => {
  return (
    <div>
      <h2>Settings</h2>
      <DocTypesPanel />
    </div>
  );
};

export default Settings;
