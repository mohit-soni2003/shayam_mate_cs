import { useState } from "react";

const emptyValues = {
  code: "",
  name: "",
  description: "",
  appliesTo: [],
  periodicity: "",
  dueRuleText: "",
  requiredDocuments: [],
  defaultProfessionalFee: "",
  defaultGovtFee: "",
  clientSelectable: false,
};

const labelStyle = { display: "flex", alignItems: "center", gap: 6, fontSize: 14 };

const ComplianceTypeForm = ({ options, initialValues, onSubmit, submitting, error, submitLabel }) => {
  const [values, setValues] = useState({ ...emptyValues, ...initialValues });

  const toggleArrayValue = (field, value) => {
    setValues((prev) => {
      const current = prev[field];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...values,
      defaultProfessionalFee: Number(values.defaultProfessionalFee) || 0,
      defaultGovtFee: Number(values.defaultGovtFee) || 0,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}
    >
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="Code (e.g. AOC-4)"
          value={values.code}
          onChange={(e) => setValues({ ...values, code: e.target.value })}
          required
        />
        <select
          className="input"
          value={values.periodicity}
          onChange={(e) => setValues({ ...values, periodicity: e.target.value })}
          required
        >
          <option value="" disabled>
            Periodicity
          </option>
          {options.periodicity.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <input
        className="input"
        placeholder="Name (e.g. Filing of financial statements)"
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
        required
      />

      <textarea
        className="input"
        placeholder="Description (shown to clients)"
        rows={2}
        value={values.description}
        onChange={(e) => setValues({ ...values, description: e.target.value })}
      />

      <input
        className="input"
        placeholder='Due rule text (e.g. "Within 30 days of the AGM")'
        value={values.dueRuleText}
        onChange={(e) => setValues({ ...values, dueRuleText: e.target.value })}
      />

      <div>
        <div className="text-muted" style={{ fontSize: 13, marginBottom: 6 }}>
          Applies to
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {options.appliesTo.map((option) => (
            <label key={option} style={labelStyle}>
              <input
                type="checkbox"
                checked={values.appliesTo.includes(option)}
                onChange={() => toggleArrayValue("appliesTo", option)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="text-muted" style={{ fontSize: 13, marginBottom: 6 }}>
          Required documents
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            maxHeight: 140,
            overflowY: "auto",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 10,
          }}
        >
          {options.documentTypes.map((option) => (
            <label key={option} style={labelStyle}>
              <input
                type="checkbox"
                checked={values.requiredDocuments.includes(option)}
                onChange={() => toggleArrayValue("requiredDocuments", option)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Professional fee (₹)"
          value={values.defaultProfessionalFee}
          onChange={(e) => setValues({ ...values, defaultProfessionalFee: e.target.value })}
        />
        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Govt fee (₹)"
          value={values.defaultGovtFee}
          onChange={(e) => setValues({ ...values, defaultGovtFee: e.target.value })}
        />
      </div>

      <label style={labelStyle}>
        <input
          type="checkbox"
          checked={values.clientSelectable}
          onChange={(e) => setValues({ ...values, clientSelectable: e.target.checked })}
        />
        Published — visible in the client service list
      </label>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

export default ComplianceTypeForm;
