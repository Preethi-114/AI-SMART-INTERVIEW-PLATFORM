import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginForm({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // API call to login
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Call success handler
      onLoginSuccess(data);

    } catch (error) {
      console.error("Login error:", error);
      setErrors({ 
        submit: error.message || "Invalid credentials. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Email Input */}
      <div className="mb-4">
        <label htmlFor="email" className="form-label fw-semibold">
          Email Address
        </label>
        <div className="input-group">
          <span className="input-group-text bg-light">
            <i className="fas fa-envelope text-muted"></i>
          </span>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <div className="invalid-feedback d-block">
            <i className="fas fa-exclamation-circle me-1"></i>
            {errors.email}
          </div>
        )}
      </div>

      {/* Password Input */}
      <div className="mb-4">
        <label htmlFor="password" className="form-label fw-semibold">
          Password
        </label>
        <div className="input-group">
          <span className="input-group-text bg-light">
            <i className="fas fa-lock text-muted"></i>
          </span>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
        {errors.password && (
          <div className="invalid-feedback d-block">
            <i className="fas fa-exclamation-circle me-1"></i>
            {errors.password}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="form-check">
          <input
            type="checkbox"
            id="rememberMe"
            className="form-check-input"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="rememberMe" className="form-check-label text-muted">
            Remember me
          </label>
        </div>
        <Link 
          to="/forgot-password" 
          className="text-decoration-none small"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-primary btn-lg w-100 py-3 mb-3"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Signing in...
          </>
        ) : (
          <>
            <i className="fas fa-sign-in-alt me-2"></i>
            Sign In
          </>
        )}
      </button>

      {/* Error Message */}
      {errors.submit && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {errors.submit}
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrors(prev => ({ ...prev, submit: "" }))}
          ></button>
        </div>
      )}

      {/* Divider */}
      <div className="text-center my-4">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1 border-top"></div>
          <span className="mx-3 text-muted">or</span>
          <div className="flex-grow-1 border-top"></div>
        </div>
      </div>
    </form>
  );
}