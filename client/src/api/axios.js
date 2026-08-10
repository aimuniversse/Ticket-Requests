import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${apiBaseUrl}/api/`,
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

const getStoredRefreshToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken") || null;
};

const storeTokens = (access, refresh) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("access", access);
  localStorage.setItem("token", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);
};

const isOperatorPath = () =>
  typeof window !== "undefined" &&
  (window.location.pathname.startsWith("/operator") ||
    window.location.pathname.startsWith("/admin"));

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err?.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuth &&
      isOperatorPath()
    ) {
      const refreshToken = getStoredRefreshToken();

      if (refreshToken && !isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post(
            `${apiBaseUrl}/api/auth/refresh/`,
            { refresh: refreshToken }
          );
          const newAccess = response.data.access;
          const newRefresh = response.data.refresh || refreshToken;
          storeTokens(newAccess, newRefresh);
          processQueue(null, newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("access");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userRole");
          window.location.replace("/operator-login");
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (refreshToken && isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("access");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      window.location.replace("/operator-login");
    }

    return Promise.reject(err);
  }
);

export default api;