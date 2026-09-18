import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Avatar from "../common/Avatar";
import { MenuIcon, BellIcon } from "../common/icons";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const titleCase = (segment) =>
  segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

// The last path segment becomes the page title: "/admin/compliance-catalog"
// -> "Compliance Catalog", "/client" or "/admin" (index) -> "Overview". Self
// maintaining — a new route needs no separate title registered anywhere. A
// route ending in a record id (e.g. "/admin/clients/<uuid>") titles off the
// segment before it instead, since a raw id makes for a useless heading.
const deriveTitle = (pathname) => {
  const segments = pathname.split("/").filter(Boolean);
  let last = segments[segments.length - 1];

  if (last && UUID_RE.test(last)) {
    last = segments[segments.length - 2];
  }

  if (!last || last === "admin" || last === "client") return "Overview";
  return titleCase(last);
};

// Lives in DashboardShell, outside the routed <Outlet/> — it never unmounts
// or changes shape across navigation. Only the derived title updates.
const DashboardHeader = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const title = deriveTitle(location.pathname);

  return (
    <header className="dashboard-header">
      <div className="dashboard-header__left">
        <button type="button" className="hamburger-btn" aria-label="Toggle menu" onClick={onToggleSidebar}>
          <MenuIcon />
        </button>

        <div className="dashboard-header__brand">
          <span className="dashboard-header__brand-name">Shyam Mate</span>
          <span className="dashboard-header__brand-sub">Consultancy</span>
        </div>

        <span className="dashboard-header__divider" aria-hidden="true" />

        <h1 className="dashboard-header__title">{title}</h1>
      </div>

      <div className="dashboard-header__right">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <BellIcon />
          <span className="icon-btn__dot" aria-hidden="true" />
        </button>
        <Avatar name={user?.full_name} avatarUrl={user?.avatar_url} size={34} />
      </div>
    </header>
  );
};

export default DashboardHeader;
