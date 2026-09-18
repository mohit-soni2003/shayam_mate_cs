import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useAuthStore } from "./store/authStore";
import Loader from "./component/common/Loader.jsx";

import { ProtectedRoute, AdminConsoleRoute, ClientRoute } from "./routes/guards.jsx";
import { publicRoutes } from "./routes/publicRoutes.jsx";
import { adminRoutes } from "./routes/adminRoutes.jsx";
import { clientRoutes } from "./routes/clientRoutes.jsx";

import AdminLayout from "./Layout/AdminLayout.jsx";
import ClientLayout from "./Layout/ClientLayout.jsx";

function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {publicRoutes}

        {/* Admin + Staff share one console */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminConsoleRoute>
                <AdminLayout />
              </AdminConsoleRoute>
            </ProtectedRoute>
          }
        >
          {adminRoutes}
        </Route>

        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <ClientLayout />
              </ClientRoute>
            </ProtectedRoute>
          }
        >
          {clientRoutes}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
