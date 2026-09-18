import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useEntityStore } from "../../store/entityStore";
import LinkEntityAction from "./LinkEntityAction";
import SidebarProfile from "./SidebarProfile";
import { ChevronDownIcon } from "../common/icons";

const NAV_ITEMS = [
  { label: "Overview", to: "/client", end: true },
  { label: "Compliance", to: "/client/compliance" },
  {
    label: "Documents",
    basePath: "/client/documents",
    children: [
      { label: "Upload Document", to: "/client/documents/upload-document" },
      { label: "My Documents", to: "/client/documents/my-documents" },
    ],
  },
  { label: "Payments", to: "/client/payments" },
  { label: "Chat", to: "/client/chat" },
];

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 16px",
  borderRadius: "var(--radius)",
  color: isActive ? "var(--sidebar-primary-foreground)" : "var(--sidebar-foreground)",
  background: isActive ? "var(--sidebar-active)" : "transparent",
  fontWeight: isActive ? 600 : 400,
});

const subLinkStyle = ({ isActive }) => ({
  display: "block",
  padding: "8px 16px 8px 40px",
  borderRadius: "var(--radius)",
  fontSize: 14,
  color: isActive ? "var(--sidebar-primary-foreground)" : "var(--sidebar-muted-foreground)",
  background: isActive ? "var(--sidebar-active)" : "transparent",
  fontWeight: isActive ? 600 : 400,
});

// A nav item with `children` renders as an expand/collapse section instead
// of a plain link — starts open when the current route already lives under
// it (e.g. landing on /client/documents/my-documents), closed otherwise.
const NavSection = ({ item, onNavigate }) => {
  const location = useLocation();
  const isChildActive = location.pathname.startsWith(item.basePath);
  // No override yet -> follow the active route. Once the user has clicked
  // the toggle, their choice wins even if the route stays inside this section.
  const [manualOpen, setManualOpen] = useState(null);
  const isOpen = manualOpen === null ? isChildActive : manualOpen;

  return (
    <div>
      <button
        type="button"
        onClick={() => setManualOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderRadius: "var(--radius)",
          border: "none",
          background: "transparent",
          color: isChildActive ? "var(--sidebar-primary-foreground)" : "var(--sidebar-foreground)",
          fontWeight: isChildActive ? 600 : 400,
          fontSize: "inherit",
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        {item.label}
        <ChevronDownIcon
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
            flexShrink: 0,
          }}
        />
      </button>

      {isOpen && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
          {item.children.map((child) => (
            <NavLink key={child.to} to={child.to} style={subLinkStyle} onClick={onNavigate}>
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const EntitySwitcher = () => {
  const { entities, selectedEntityId, isLoading, selectEntity, fetchEntities } = useEntityStore();

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  if (isLoading) {
    return null;
  }

  if (entities.length === 0) {
    return (
      <div
        style={{
          margin: "0 16px 12px",
          padding: "8px 12px",
          borderRadius: "var(--radius)",
          background: "var(--sidebar-active)",
          fontSize: 13,
          color: "var(--sidebar-muted-foreground)",
        }}
      >
        No company linked yet
      </div>
    );
  }

  const selected = entities.find((e) => e.id === selectedEntityId) || entities[0];

  if (entities.length === 1) {
    return (
      <div
        style={{
          margin: "0 16px 12px",
          padding: "8px 12px",
          borderRadius: "var(--radius)",
          background: "var(--sidebar-active)",
          fontSize: 13,
          color: "var(--sidebar-foreground)",
        }}
      >
        {selected.name} · {selected.entity_type}
      </div>
    );
  }

  return (
    <select
      className="input"
      style={{
        margin: "0 16px 12px",
        width: "calc(100% - 32px)",
        background: "var(--sidebar-active)",
        color: "var(--sidebar-foreground)",
        borderColor: "var(--sidebar-border)",
      }}
      value={selected.id}
      onChange={(e) => selectEntity(e.target.value)}
    >
      {entities.map((entity) => (
        <option key={entity.id} value={entity.id}>
          {entity.name} · {entity.entity_type}
        </option>
      ))}
    </select>
  );
};

// isOpen/onNavigate come from DashboardShell — mobile-drawer state lives
// there since it's shared plumbing with the hamburger button and backdrop.
const ClientSidebar = ({ isOpen, onNavigate }) => {
  const { user, logout } = useAuthStore();

  return (
    <aside className={`app-sidebar${isOpen ? " app-sidebar--open" : ""}`}>
      <SidebarProfile name={user?.full_name} role="Client" avatarUrl={user?.avatar_url} />

      <EntitySwitcher />
      <LinkEntityAction />

      {NAV_ITEMS.map((item) =>
        item.children ? (
          <NavSection key={item.label} item={item} onNavigate={onNavigate} />
        ) : (
          <NavLink key={item.to} to={item.to} end={item.end} style={linkStyle} onClick={onNavigate}>
            {item.label}
          </NavLink>
        )
      )}

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--sidebar-border)" }}>
        <button
          type="button"
          className="btn btn-outline"
          style={{ width: "100%", color: "var(--sidebar-foreground)", borderColor: "var(--sidebar-border)" }}
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default ClientSidebar;
