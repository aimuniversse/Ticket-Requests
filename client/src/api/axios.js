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

=======
<<<<<<< HEAD
  baseURL: `${apiBaseUrl}/api/`,
=======
<<<<<<< HEAD
>>>>>>> 7c4aa1f8db2fb0d86b3853259ec6273f6ca95d83
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/`,

  baseURL: `${import.meta.env.VITE_API_URL || ""}/api/`,
<<<<<<< HEAD
 
=======
>>>>>>> 3ecfc87015048b1302280ace2b7322f8d95622a1
>>>>>>> 2a568f1e841e64fb9e5f7864512befd6279bcf6f
>>>>>>> 4d51ba85b1b2c4d5416553f837d75967d6f52959
>>>>>>> 7c4aa1f8db2fb0d86b3853259ec6273f6ca95d83
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
