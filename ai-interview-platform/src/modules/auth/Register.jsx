import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import Layout from "../layout/Layout";
import "../../styles/Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    // Clear general error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    
    // Frontend validation
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    
    if (formData.password.length < 6) {
      setFieldErrors({ password: "Password must be at least 6 characters long" });
      return;
    }
    
    if (!termsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };
      const result = await registerUser(userData);
      
      // Check if registration failed
      if (!result.success) {
        // Check if there are field-specific errors
        if (result.errors && result.errors.length > 0) {
          const errorsMap = {};
          result.errors.forEach(err => {
            errorsMap[err.field] = err.message;
          });
          setFieldErrors(errorsMap);
        } else {
          // Set general error message
          setError(result.message || "Registration failed");
        }
        setLoading(false);
        return;
      }

      // Handle successful registration
      // The response structure might be { success: true, data: { token, user } } 
      // or { success: true, token, user }
      const responseData = result.data || result;
      
      if (responseData.token) {
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("user", JSON.stringify(responseData.user));
        localStorage.setItem("role", responseData.user.role);
        
        const role = responseData.user.role;
        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "hr") navigate("/hr/dashboard");
        else navigate("/candidate-dashboard");
      } else {
        navigate("/login", { 
          state: { 
            message: "Registration successful! Please login." 
          } 
        });
      }

    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="register-wrapper mt-5 pt-5">
        <div className="register-card">

          {/* Header */}
          <div className="text-center mb-4">
            <h4 className="fw-semibold">Create Account</h4>
            <p className="text-muted small">
              Sign up to get started with AI Interview Platform
            </p>
          </div>

          {/* General Error message */}
          {error && (
            <div className="error-box">
              <span className="error-dot"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="input-group-custom">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={fieldErrors.firstName ? "error-input" : ""}
                  />
                  {fieldErrors.firstName && (
                    <small className="error-text">{fieldErrors.firstName}</small>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group-custom">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={fieldErrors.lastName ? "error-input" : ""}
                  />
                  {fieldErrors.lastName && (
                    <small className="error-text">{fieldErrors.lastName}</small>
                  )}
                </div>
              </div>
            </div>

            <div className="input-group-custom">
              <label>Email address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className={fieldErrors.email ? "error-input" : ""}
              />
              {fieldErrors.email && (
                <small className="error-text">{fieldErrors.email}</small>
              )}
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="input-group-custom">
                  <label>Password *</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      minLength="6"
                      className={fieldErrors.password ? "error-input" : ""}
                    />
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} toggle-password`}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </div>
                  {fieldErrors.password && (
                    <small className="error-text">{fieldErrors.password}</small>
                  )}
                  <small className="text-muted">At least 6 characters</small>
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group-custom">
                  <label>Confirm Password *</label>
                  <div className="password-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className={fieldErrors.confirmPassword ? "error-input" : ""}
                    />
                    <i
                      className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"} toggle-password`}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <small className="error-text">{fieldErrors.confirmPassword}</small>
                  )}
                </div>
              </div>
            </div>

            <div className="terms-row">
              <label className="terms">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  disabled={loading}
                />
                <span>
                  I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> *
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="text-center mt-3">
              <p className="small">
                Already have an account?{" "}
                <a href="/login" className="text-link">
                  Sign In
                </a>
              </p>
            </div>
          </form>

          <p className="footer-text">
            © 2026 AI Interview Platform
          </p>
        </div>
      </div>
    </Layout>
  );
}