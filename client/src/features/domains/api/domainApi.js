import apiClient from "../../../utils/apiClient";

export const domainApi = {
  getDomains: async () => {
    const response = await apiClient.get("/api/domains");
    return response.data;
  },
  getDomain: async (domainId) => {
    const response = await apiClient.get(`/api/domains/${domainId}`);
    return response.data;
  },
  createDomain: async (domainName) => {
    const response = await apiClient.post("/api/domains", {
      domain: domainName,
    });
    return response.data;
  },
  updateDomain: async ({ domainId, domainName }) => {
    const response = await apiClient.put(`/api/domains/${domainId}`, {
      domain: domainName,
    });
    return response.data;
  },
  deleteDomain: async (domainId) => {
    const response = await apiClient.delete(`/api/domains/${domainId}`);
    if (response.status === 204) {
      return true;
    }
    throw new Error("Failed to delete domain");
  },
};
