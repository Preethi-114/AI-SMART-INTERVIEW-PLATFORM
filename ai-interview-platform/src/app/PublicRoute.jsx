import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

export default function PublicRoute({ children }) {
  const user = getUser();

  if (user) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "hr":
        return <Navigate to="/hr/dashboard" replace />;
      default:
        return <Navigate to="/candidate-dashboard" replace />;
    }
  }

  return children;
}
