import { useEffect, useState } from "react";
import Modal from "../../component/common/Modal";
import { SkeletonTable } from "../../component/common/Skeleton";
import ComplianceTypeForm from "../../component/forms/ComplianceTypeForm";
import {
  getComplianceTypeOptionsRequest,
  getAllComplianceTypesRequest,
  createComplianceTypeRequest,
  updateComplianceTypeRequest,
} from "../../services/complianceTypeService";

const thStyle = { padding: "12px 16px", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 };
const tdStyle = { padding: "12px 16px", verticalAlign: "top" };

const toFormValues = (type) => ({
  code: type.code,
  name: type.name,
  description: type.description || "",
  appliesTo: type.applies_to || [],
  periodicity: type.periodicity,
  dueRuleText: type.due_rule_text || "",
  requiredDocuments: type.required_documents || [],
  defaultProfessionalFee: type.default_professional_fee,
  defaultGovtFee: type.default_govt_fee,
  clientSelectable: type.client_selectable,
});

const ComplianceCatalog = () => {
  const [types, setTypes] = useState([]);
  const [options, setOptions] = useState({ appliesTo: [], periodicity: [], documentTypes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [creating, setCreating] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [editError, setEditError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [typesData, optionsData] = await Promise.all([
          getAllComplianceTypesRequest(),
          getComplianceTypeOptionsRequest(),
        ]);
        setTypes(typesData);
        setOptions(optionsData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load compliance catalog");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refreshTypes = async () => {
    try {
      const data = await getAllComplianceTypesRequest();
      setTypes(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load compliance catalog");
    }
  };

  const handleCreate = async (values) => {
    setCreating(true);
    setCreateError(null);
    try {
      await createComplianceTypeRequest(values);
      setShowCreate(false);
      refreshTypes();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create compliance type");
    } finally {
      setCreating(false);
    }
  };

  const handleEditSave = async (values) => {
    setSaving(true);
    setEditError(null);
    try {
      await updateComplianceTypeRequest(editTarget.id, values);
      setEditTarget(null);
      refreshTypes();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update compliance type");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Compliance Catalog</h2>
        <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          Add Compliance Type
        </button>
      </div>

      {loading && <SkeletonTable columns={6} />}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)", textAlign: "left" }}>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Periodicity</th>
                <th style={thStyle}>Fee (₹)</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {types.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: "center" }} className="text-muted">
                    No compliance types yet.
                  </td>
                </tr>
              )}
              {types.map((type) => (
                <tr key={type.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={tdStyle}>
                    <strong>{type.code}</strong>
                  </td>
                  <td style={tdStyle}>{type.name}</td>
                  <td style={tdStyle}>{type.periodicity}</td>
                  <td style={tdStyle}>{type.default_professional_fee}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: type.client_selectable ? "var(--success)" : "var(--warning)",
                        color: type.client_selectable ? "var(--success-foreground)" : "var(--warning-foreground)",
                      }}
                    >
                      {type.client_selectable ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button type="button" className="btn btn-outline" onClick={() => setEditTarget(type)}>
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
        <Modal title="Add Compliance Type" onClose={() => setShowCreate(false)}>
          <ComplianceTypeForm
            options={options}
            onSubmit={handleCreate}
            submitting={creating}
            error={createError}
            submitLabel="Create"
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title={`Edit ${editTarget.code}`} onClose={() => setEditTarget(null)}>
          <ComplianceTypeForm
            options={options}
            initialValues={toFormValues(editTarget)}
            onSubmit={handleEditSave}
            submitting={saving}
            error={editError}
            submitLabel="Save Changes"
          />
        </Modal>
      )}
    </div>
  );
};

export default ComplianceCatalog;
