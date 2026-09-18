import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";

// Shared by AdminLayout and ClientLayout. Renders `sidebar` as a normal
// static column on desktop; below 860px it becomes an off-canvas drawer
// toggled by the hamburger in DashboardHeader, with a tap-to-close backdrop
// behind it. See .app-sidebar / .dashboard-header in style.css.
const DashboardShell = ({ sidebar: Sidebar }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="dashboard-shell" style={{ background: "var(--background)" }}>
      <Sidebar isOpen={isSidebarOpen} onNavigate={closeSidebar} />

      {isSidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}

      <div className="dashboard-main">
        <DashboardHeader onToggleSidebar={toggleSidebar} />

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
