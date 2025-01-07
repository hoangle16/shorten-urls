import apiClient from "../../../utils/apiClient";

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post("/api/auth/login", credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await apiClient.post("/api/auth/register", userData);
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post("/api/auth/logout");
    return response.data;
  },
  renewTokens: async () => {
    const response = await apiClient.post(
      "/api/auth/renew-tokens",
      {},
      { withCredentials: true }
    );
    return response.data;
  },
};
