import { Route, Navigate } from "react-router-dom";
import Overview from "../pages/client/Overview.jsx";
import Compliance from "../pages/client/Compliance.jsx";
import UploadDocument from "../pages/client/UploadDocument.jsx";
import MyDocuments from "../pages/client/MyDocuments.jsx";
import Payments from "../pages/client/Payments.jsx";
import UnderDevPage from "../pages/UnderDevPage.jsx";

export const clientRoutes = (
  <>
    <Route index element={<Overview />} />
    <Route path="compliance" element={<Compliance />} />
    {/* Old single-page link — send it to the list rather than 404. */}
    <Route path="documents" element={<Navigate to="/client/documents/my-documents" replace />} />
    <Route path="documents/upload-document" element={<UploadDocument />} />
    <Route path="documents/my-documents" element={<MyDocuments />} />
    <Route path="payments" element={<Payments />} />
    <Route path="chat" element={<UnderDevPage />} />
  </>
);
