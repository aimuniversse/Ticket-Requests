import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * useAuthRedirect
 *
 * Checks auth state from localStorage and redirects as necessary:
 *  - No token           → /operator-login
 *  - role === "admin"   → /admin/dashboard  (when requiredRole is "operator")
 *  - role === "operator"→ /operator/dashboard (when requiredRole is "admin")
 *
 * @param {"operator"|"admin"|"any"} requiredRole
 */
export function useAuthRedirect(requiredRole = "any") {
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access") ||
      localStorage.getItem("token");

    if (!token) {
      navigate("/operator-login", { replace: true });
      return;
    }

    const role = (localStorage.getItem("userRole") || "").toLowerCase();

    if (requiredRole === "operator" && role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (requiredRole === "admin" && role !== "admin") {
      navigate("/operator-login", { replace: true });
      return;
    }
  }, [navigate, requiredRole]);
}
