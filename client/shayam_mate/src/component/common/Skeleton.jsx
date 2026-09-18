// Shimmering grey/white placeholder shapes shown in place of dashboard
// content while it loads, instead of a bare "Loading..." string.

export const SkeletonBlock = ({ width = "100%", height = 14, radius = 6, style = {} }) => (
  <span className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />
);

const thStyle = { padding: "12px 16px" };
const tdStyle = { padding: "12px 16px" };

// Mirrors the header + N rows shape every list page in this dashboard uses.
export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="card" style={{ overflow: "hidden" }}>
    <div className="table-scroll">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--muted)" }}>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} style={thStyle}>
                <SkeletonBlock height={11} width="55%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} style={{ borderTop: "1px solid var(--border)" }}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} style={tdStyle}>
                  <SkeletonBlock height={14} width={c === 0 ? "80%" : "50%"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Stacked label + input placeholders, for pages guarding a form while
// reference data (doc types, options, etc.) loads.
export const SkeletonForm = ({ fields = 3 }) => (
  <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <SkeletonBlock height={11} width={110} />
        <SkeletonBlock height={38} width="100%" radius={8} />
      </div>
    ))}
  </div>
);

// A row of stacked cards — title + two text lines + an action-shaped block —
// for card-list pages like the client's compliance services list.
export const SkeletonCards = ({ count = 3 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card" style={{ padding: 18, display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <SkeletonBlock height={14} width="40%" />
          <SkeletonBlock height={12} width="70%" />
          <SkeletonBlock height={12} width="55%" />
        </div>
        <SkeletonBlock height={38} width={140} radius={8} style={{ flexShrink: 0, alignSelf: "center" }} />
      </div>
    ))}
  </div>
);
