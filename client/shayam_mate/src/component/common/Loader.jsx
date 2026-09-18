import { SkeletonBlock } from "./Skeleton";

// Shown once, on a hard refresh, while checkAuth() resolves — before we even
// know whether this is an admin or client session, so it previews a generic
// dashboard shape (sidebar + header + content) rather than committing to one.
const Loader = () => (
  <div style={{ minHeight: "100vh", display: "flex", background: "var(--background)" }}>
    <div
      style={{
        width: 240,
        minHeight: "100vh",
        background: "var(--sidebar)",
        padding: 16,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <SkeletonBlock height={88} width={88} radius="50%" style={{ marginTop: 8 }} />
      <SkeletonBlock height={14} width={120} />
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonBlock key={i} height={16} width="100%" radius={8} />
      ))}
    </div>

    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <SkeletonBlock height={20} width={160} />
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        <SkeletonBlock height={90} radius={10} />
        <SkeletonBlock height={200} radius={10} />
      </div>
    </div>
  </div>
);

export default Loader;
