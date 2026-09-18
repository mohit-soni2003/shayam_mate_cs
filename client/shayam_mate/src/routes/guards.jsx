import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Each guard reads the auth store itself, so any page can import and use
// these directly without threading auth state through props.

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Admin and Staff share one console (see spec: "no third dashboard") — this
// guard allows either role in. The console itself hides/disables actions the
// signed-in role can't take.
export function AdminConsoleRoute({ children }) {
  const { user } = useAuthStore();

  if (user && (user.role === "admin" || user.role === "staff")) {
    return children;
  }

  return <Navigate to="/" replace />;
}

export function ClientRoute({ children }) {
  const { user } = useAuthStore();

  if (user && user.role === "client") {
    return children;
  }

  return <Navigate to="/" replace />;
}
