import axios from "axios";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/`,
  headers: {
    "Content-Type": "application/json",
  },
});

const getStoredToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token") ||
    null
  );
};

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/operator") || window.location.pathname.startsWith("/admin")) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("access");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userRole");
        window.location.assign("/operator-login");
      }
    }

    return Promise.reject(err);
  }
);

export default api;
