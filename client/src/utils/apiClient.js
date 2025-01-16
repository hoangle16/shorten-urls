import axios from "axios";
import { authApi } from "../features/auth/api/authApi";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("error test", error);
      if (
        error.response?.data?.message !==
        "Access denied. The token is blacklisted."
      ) {
        originalRequest._retry = true;
        try {
          const data = await authApi.renewTokens();
          const token = data.token;
          localStorage.setItem("token", token);

          originalRequest.headers["Authorization"] = token;
          return apiClient(originalRequest);
        } catch (err) {}
        console.error("Failed to refresh token", err);
      }

      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
