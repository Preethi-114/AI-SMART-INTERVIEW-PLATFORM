import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import Layout from "../layout/Layout";
import "../../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  // ✅ Profile completion check function
  const checkProfileCompletion = (user) => {
    // Check basic required fields
    // if (!user.firstName || !user.lastName || !user.email) {
    //   return false;
    // }
    
    // // Check if fields are not empty strings
    // if (user.firstName.trim() === '' || user.lastName.trim() === '') {
    //   return false;
    // }
    
    // Check skills (at least one technical skill)
    // if (!user.skills || !user.skills.technical || user.skills.technical.length === 0) {
    //   return false;
    // }
    
    // Optional: Check resume (uncomment if required)
    // if (!user.resume || !user.resume.url) {
    //   return false;
    // }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(email, password);

      if (!result.success) {
        setError(result.message || "Invalid credentials");
        return;
      }

      // Remember email
      if (remember) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // Save auth
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      localStorage.setItem("role", result.data.user.role);

      // ✅ CHECK PROFILE COMPLETION BEFORE REDIRECTING
      const user = result.data.user;
      const isProfileComplete = checkProfileCompletion(user);
      
      console.log("User profile complete?", isProfileComplete);
      console.log("User data:", user);
      
      // Redirect based on profile completion
      const role = user.role;
      
      if (!isProfileComplete) {
        // Profile incomplete - redirect to profile page first
        console.log("Profile incomplete, redirecting to /profile");
        navigate("/profile");
      } else {
        // Profile complete - go to respective dashboard
        console.log("Profile complete, redirecting to dashboard");
        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "hr") navigate("/hr/dashboard");
        else navigate("/candidate-dashboard");
      }

    } catch (err) {
      console.log(err);
      setError("Server not reachable. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="login-wrapper mt-5 pt-5">
        <div className="login-card">

          {/* Header */}
          <div className="text-center mb-4">
            <h4 className="fw-semibold">Welcome back</h4>
            <p className="text-muted small">
              Please sign in to continue
            </p>

          </div>

          {/* Error message */}
          {error && (
            <div className="error-box">
              <span className="error-dot"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>

            <div className="input-group-custom">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="input-group-custom">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} toggle-password`}
                  onClick={() => setShowPassword(!showPassword)}
                />

              </div>
            </div>

            <div className="options-row">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                Remember me
              </label>

              <span className="forgot">Forgot password?</span>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p className="footer-text">
            © 2026 AI Interview Platform
          </p>
        </div>
      </div>
    </Layout>
  );
}