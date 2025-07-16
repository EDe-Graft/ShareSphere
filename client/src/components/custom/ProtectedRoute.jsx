// assets/components/ProtectedRoute.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, authSuccess } = useAuth();
  const location = useLocation();

  if (!authSuccess) {
    // Redirect to sign-in page, preserving the location they tried to access
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }
  //if authSuccess
  return children;
}
