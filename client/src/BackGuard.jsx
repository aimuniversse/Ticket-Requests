import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BackGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    const handlePopState = () => {
      const previousPath = previousPathRef.current;
      const nextPath = window.location.pathname;
      const wasInsidePortal =
        previousPath.startsWith("/operator") || previousPath.startsWith("/admin");
      const landedOnLogin =
        nextPath === "/operator-login" || nextPath === "/admin-login";
      if (wasInsidePortal && landedOnLogin) {
        navigate("/", { replace: true });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  return children;
};

export default BackGuard;
