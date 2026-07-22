import axios from "axios";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
<<<<<<< HEAD
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/`,
=======
<<<<<<< HEAD
  baseURL: `${apiBaseUrl}/api/`,
=======
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api/`,
>>>>>>> 3ecfc87015048b1302280ace2b7322f8d95622a1
>>>>>>> 2a568f1e841e64fb9e5f7864512befd6279bcf6f
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
