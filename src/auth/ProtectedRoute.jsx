import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, booting } = useAuth();

  if (booting) return <div className="p-8">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return children;
}
