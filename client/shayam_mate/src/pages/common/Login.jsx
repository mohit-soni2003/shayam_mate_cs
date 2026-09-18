import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { homePathForRole } from "../../routes/roleRedirect";
import { supabase } from "../../lib/supabaseClient";
import "../../assets/utility/auth.css";
import AuthLayout from "../../component/auth/AuthLayout";
import { GoogleIcon, EyeIcon, EyeOffIcon } from "../../component/auth/icons";

const Login = () => {
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

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <AuthLayout
      variant="client"
      title="Welcome back"
      subtitle="Log in to track your compliance, documents and requests."
      footer={
        <>
          New here? <Link to="/signup">Create an account</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="input"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <div className="auth-input-wrap">
            <input
              id="login-password"
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

      <div className="auth-divider">or</div>

      <button type="button" className="btn btn-outline auth-google-btn" onClick={handleGoogleLogin}>
        <GoogleIcon />
        Continue with Google
      </button>
    </AuthLayout>
  );
};

export default Login;
