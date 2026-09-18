import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabaseClient";
import "../../assets/utility/auth.css";
import AuthLayout from "../../component/auth/AuthLayout";
import { GoogleIcon, EyeIcon, EyeOffIcon, MailCheckIcon } from "../../component/auth/icons";

const Signup = () => {
  const navigate = useNavigate();
  const { registerClient, isLoading, error } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await registerClient(email, password, fullName);
    if (ok) setSubmitted(true);
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <AuthLayout
      variant="client"
      title={submitted ? "Check your inbox" : "Create your account"}
      subtitle={submitted ? undefined : "Set up client access to manage your compliance online."}
      footer={
        !submitted && (
          <>
            Already have an account? <Link to="/login">Login</Link>
          </>
        )
      }
    >
      {submitted ? (
        <div className="auth-success">
          <span className="auth-success__icon">
            <MailCheckIcon />
          </span>
          <p>
            We&apos;ve sent a verification link to <strong>{email}</strong>. Confirm it before logging in.
          </p>
          <button type="button" className="btn btn-primary auth-submit" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      ) : (
        <>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                className="input"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password">Password</label>
              <div className="auth-input-wrap">
                <input
                  id="signup-password"
                  className="input"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
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
              {isLoading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <button type="button" className="btn btn-outline auth-google-btn" onClick={handleGoogleSignup}>
            <GoogleIcon />
            Continue with Google
          </button>
        </>
      )}
    </AuthLayout>
  );
};

export default Signup;
