import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { homePathForRole } from "../../routes/roleRedirect";

// Landing point after Google redirects back from Supabase. supabase-js parses
// the URL fragment automatically; we just read the resulting session and hand
// it to our backend to provision/sync the profile and start our own session.
const AuthCallback = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuthStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    const completeLogin = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        setError("Google sign-in failed. Please try again.");
        return;
      }

      const ok = await loginWithGoogle(data.session.access_token, data.session.refresh_token);

      if (ok) {
        const { user } = useAuthStore.getState();
        navigate(homePathForRole(user.role), { replace: true });
      } else {
        setError("Could not complete Google sign-in. Please try again.");
      }
    };

    completeLogin();
  }, [loginWithGoogle, navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {error ? <p className="error-text">{error}</p> : <p className="text-muted">Signing you in...</p>}
    </div>
  );
};

export default AuthCallback;
