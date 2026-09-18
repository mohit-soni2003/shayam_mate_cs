import { Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage.jsx";
import Login from "../pages/common/Login.jsx";
import Signup from "../pages/common/Signup.jsx";
import AdminLogin from "../pages/common/AdminLogin.jsx";
import AuthCallback from "../pages/common/AuthCallback.jsx";

export const publicRoutes = (
  <>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/admin-login" element={<AdminLogin />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
  </>
);
