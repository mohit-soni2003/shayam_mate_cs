import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { homePathForRole } from "../../routes/roleRedirect";
import "../../assets/utility/auth.css";
import AuthLayout from "../../component/auth/AuthLayout";
import { EyeIcon, EyeOffIcon, ArrowLeftIcon } from "../../component/auth/icons";

// Same /auth/login endpoint as the client login — Admin and Staff both land
// here (Staff never self-registers; Admin is bootstrapped once via Postman).
const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      const { user } = useAuthStore.getState();
      navigate(homePathForRole(user.role));
    }
  };

  return (
    <AuthLayout
      variant="admin"
      title="Admin & Staff Login"
      subtitle="Sign in with the credentials issued to you by the practice."
      footer={
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeftIcon /> Back to website
        </Link>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            className="input"
            type="email"
            placeholder="you@shyammate.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="admin-password">Password</label>
          <div className="auth-input-wrap">
            <input
              id="admin-password"
              className="input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
          {isLoading && <span className="auth-spinner" aria-hidden="true" />}
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;
