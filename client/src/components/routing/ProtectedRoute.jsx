import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 *
 * Wraps children with auth + role checks.
 * Redirects to /operator-login when unauthenticated, or to the correct
 * dashboard when the role doesn't match.
 *
 * @param {"operator"|"admin"|"any"} role  - Required role to access the route.
 * @param {React.ReactNode}          children
 */
function ProtectedRoute({ role = "any", children }) {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/operator-login" replace />;
  }

  const userRole = (localStorage.getItem("userRole") || "").toLowerCase();

  if (role === "operator" && userRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === "admin" && userRole !== "admin") {
    return <Navigate to="/operator-login" replace />;
  }

  return children;
}

export default ProtectedRoute;
