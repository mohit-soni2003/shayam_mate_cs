import { Route } from "react-router-dom";
import Overview from "../pages/admin/Overview.jsx";
import Clients from "../pages/admin/Clients.jsx";
import ClientDetail from "../pages/admin/ClientDetail.jsx";
import Staff from "../pages/admin/Staff.jsx";
import ComplianceCatalog from "../pages/admin/ComplianceCatalog.jsx";
import Entities from "../pages/admin/Entities.jsx";
import ServiceRequests from "../pages/admin/ServiceRequests.jsx";
import ServiceRequestDetail from "../pages/admin/ServiceRequestDetail.jsx";
import Leads from "../pages/admin/Leads.jsx";
import Documents from "../pages/admin/Documents.jsx";
import Settings from "../pages/admin/Settings.jsx";
import Billing from "../pages/admin/Billing.jsx";
import UnderDevPage from "../pages/UnderDevPage.jsx";

// Shared by Admin and Staff (one console, permission matrix hides/disables
// actions per role — see spec Section 1.2). Non-overview pages are stubs
// until Documents / Compliance / Payments modules are built.
export const adminRoutes = (
  <>
    <Route index element={<Overview />} />
    <Route path="clients" element={<Clients />} />
    <Route path="clients/:id" element={<ClientDetail />} />
    <Route path="staff" element={<Staff />} />
    <Route path="compliance-catalog" element={<ComplianceCatalog />} />
    <Route path="entities" element={<Entities />} />
    <Route path="service-requests" element={<ServiceRequests />} />
    <Route path="service-requests/:id" element={<ServiceRequestDetail />} />
    <Route path="leads" element={<Leads />} />
    <Route path="documents" element={<Documents />} />
    <Route path="billing" element={<Billing />} />
    <Route path="conversations" element={<UnderDevPage />} />
    <Route path="settings" element={<Settings />} />
  </>
);
