// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // You'll need to install this: npm install jwt-decode

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode the token to get user role
    const decoded = jwtDecode(token);
    const userRole = decoded.role || 'candidate'; // Adjust based on your token structure
    
    // If allowedRoles is empty, allow any authenticated user
    // Otherwise, check if user's role is in allowedRoles
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === 'hr') {
        return <Navigate to="/hr/dashboard" replace />;
      } else {
        return <Navigate to="/candidate-dashboard" replace />;
      }
    }
    
    return children;
  } catch (error) {
    // If token is invalid, clear it and redirect to login
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}