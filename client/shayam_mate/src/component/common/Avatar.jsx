// Generic silhouette, drawn inline so there's no asset file to ship or ever
// 404 — this is the "dummy user" placeholder until a real photo is set.
const DummyUserIcon = ({ size }) => (
  <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <path d="M4 20.5c0-4.7 3.6-7.5 8-7.5s8 2.8 8 7.5" fill="currentColor" />
  </svg>
);

// Dummy placeholder until the real upload flow (Settings -> Cloudinary,
// same pattern as documents) exists. Renders the real photo once
// avatarUrl is set; until then, a generic silhouette on a muted circle.
const Avatar = ({ name, avatarUrl, size = 36 }) => {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "User"}
        width={size}
        height={size}
        style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }

  return (
    <div
      aria-label={name || "User"}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--muted)",
        color: "var(--muted-foreground)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <DummyUserIcon size={size} />
    </div>
  );
};

export default Avatar;
