import API from "../api/axios";

export const getAssignedRequests = () => API.get("auth/requests/assigned/");

export const getOperatorProfile = () => {
  const storedUser = localStorage.getItem("user");

  return Promise.resolve({
    data: storedUser ? JSON.parse(storedUser) : null,
  });
};