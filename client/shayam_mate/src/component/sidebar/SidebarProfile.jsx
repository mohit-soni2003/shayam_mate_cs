import Avatar from "../common/Avatar";

const SidebarProfile = ({ name, role, avatarUrl }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      padding: "28px 16px 20px",
      borderBottom: "1px solid var(--sidebar-border)",
      // Bleeds past the sidebar's own 16px padding so the divider runs
      // edge-to-edge instead of stopping short like the nav links do.
      margin: "-16px -16px 12px",
    }}
  >
    <Avatar name={name} avatarUrl={avatarUrl} size={88} />
    <div style={{ marginTop: 12, fontSize: 16, fontWeight: 700, color: "#fff" }}>{name}</div>
    {role && (
      <div
        style={{
          marginTop: 2,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--sidebar-muted-foreground)",
        }}
      >
        {role}
      </div>
    )}
  </div>
);

export default SidebarProfile;
