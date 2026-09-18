const Modal = ({ title, onClose, children }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "var(--overlay)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16,
    }}
    onClick={onClose}
  >
    <div
      className="card"
      style={{ width: "100%", maxWidth: 420, padding: 24, maxHeight: "90vh", overflowY: "auto" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button type="button" className="btn btn-outline" style={{ padding: "4px 10px" }} onClick={onClose}>
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;
