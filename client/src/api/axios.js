import axios from "axios";
import { clearAppCache, clearAuth, getAccessToken, getRefreshToken, storeAuth } from "./auth";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${apiBaseUrl}/api/`,
  headers: {
    "Content-Type": "application/json",
  },
});

const isOperatorPath = () =>
  typeof window !== "undefined" &&
  (window.location.pathname.startsWith("/operator") ||
    window.location.pathname.startsWith("/admin"));

api.interceptors.request.use((config) => {
  const token = getAccessToken();
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
      const refreshToken = getRefreshToken();

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
          storeAuth({ access: newAccess, refresh: newRefresh });
          processQueue(null, newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearAuth();
          clearAppCache();
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

      clearAuth();
      clearAppCache();
      window.location.replace("/operator-login");
    }

    return Promise.reject(err);
  }
);

export default api;