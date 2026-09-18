import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import SidebarProfile from "./SidebarProfile";

// Admin and Staff share this same console (spec: "no third dashboard").
// Items marked adminOnly are hidden for Staff instead of building a second UI.
const NAV_ITEMS = [
  { label: "Overview", to: "/admin", end: true, adminOnly: false },
  // Clients/Staff are admin-only for now — the backend only scopes these to
  // Admin until staff entity-assignment (spec Section 1.2) is built.
  { label: "Clients", to: "/admin/clients", adminOnly: true },
  { label: "Staff", to: "/admin/staff", adminOnly: true },
  // Catalog management is Admin-only by spec (4.1: "Staff cannot edit the catalog").
  { label: "Compliance Catalog", to: "/admin/compliance-catalog", adminOnly: true },
  // Entities/service requests are admin-only for now, same reason as Clients/Staff.
  { label: "Entities", to: "/admin/entities", adminOnly: true },
  { label: "Service Requests", to: "/admin/service-requests", adminOnly: true },
  // Leads come from the public website, not client accounts — Staff can work them too.
  { label: "Leads", to: "/admin/leads", adminOnly: false },
  // Documents genuinely is a Staff task too (spec 1.4: Staff can pre-check).
  { label: "Documents", to: "/admin/documents", adminOnly: false },
  // Invoicing/payments are admin-only, same as every other money-related action.
  { label: "Billing", to: "/admin/billing", adminOnly: true },
  { label: "Conversations", to: "/admin/conversations", adminOnly: false },
  { label: "Settings", to: "/admin/settings", adminOnly: true },
];

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 16px",
  borderRadius: "var(--radius)",
  color: isActive ? "var(--sidebar-primary-foreground)" : "var(--sidebar-foreground)",
  background: isActive ? "var(--sidebar-active)" : "transparent",
  fontWeight: isActive ? 600 : 400,
});

// isOpen/onNavigate come from DashboardShell — mobile-drawer state lives
// there since it's shared plumbing with the hamburger button and backdrop.
const AdminSidebar = ({ isOpen, onNavigate }) => {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === "admin";

  return (
    <aside className={`app-sidebar${isOpen ? " app-sidebar--open" : ""}`}>
      <SidebarProfile name={user?.full_name} role={user?.role} avatarUrl={user?.avatar_url} />

      {NAV_ITEMS.filter((item) => isAdmin || !item.adminOnly).map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} style={linkStyle} onClick={onNavigate}>
          {item.label}
        </NavLink>
      ))}

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

export default AdminSidebar;
