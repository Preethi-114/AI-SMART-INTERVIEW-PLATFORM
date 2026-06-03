import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get the authorization code from URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const error = params.get('error');

        if (error) {
          console.error("Google OAuth error:", error);
          navigate("/register?error=google_auth_failed");
          return;
        }

        if (!code) {
          navigate("/register?error=no_auth_code");
          return;
        }

        // Exchange code for token and user info
        const response = await fetch('http://localhost:5000/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const result = await response.json();

        if (result.success) {
          // Save user data and redirect
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));
          localStorage.setItem("role", result.user.role);
          
          // Redirect to saved page or dashboard
          const redirectTo = localStorage.getItem("redirectAfterGoogleAuth") || "/candidate-dashboard";
          localStorage.removeItem("redirectAfterGoogleAuth");
          
          navigate(redirectTo);
        } else {
          navigate("/register?error=registration_failed");
        }

      } catch (err) {
        console.error("Google callback error:", err);
        navigate("/register?error=server_error");
      }
    };

    handleGoogleCallback();
  }, [location, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div className="spinner-border text-primary mb-3"></div>
      <p>Completing Google Signup...</p>
    </div>
  );
}