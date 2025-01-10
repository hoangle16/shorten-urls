import apiClient from "../../../utils/apiClient";
import { generateQueryURL } from "../../../utils/helper";

export const linkApi = {
  getLinks: async ({
    search,
    isExpired,
    hasPassword,
    isDisabled,
    sortBy,
    sortOrder,
    page,
    limit,
  }) => {
    const url = generateQueryURL("/api/links", {
      search,
      isExpired,
      hasPassword,
      isDisabled,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    const response = await apiClient.get(url);
    return response.data;
  },
  getLinksByUserId: async ({
    userId,
    search,
    isExpired,
    hasPassword,
    sortBy,
    sortOrder,
    page,
    limit,
  }) => {
    const url = generateQueryURL(`/api/links/users/${userId}`, {
      search,
      isExpired,
      hasPassword,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    const response = await apiClient.get(url);
    return response.data;
  },
  getProtectedLinkByShortUrl: async (shortCode, password) => {
    const response = await apiClient.post(`/${shortCode}/protected`, {
      password,
    });
    return response.data;
  },
  getLinkById: async (linkId) => {
    const response = await apiClient.get(`/api/links/${linkId}`);
    return response.data;
  },
  createLink: async (linkData) => {
    const response = await apiClient.post("/api/links", linkData);
    return response.data;
  },
  updateLinkStatus: async ({ linkId, isDisabled, message }) => {
    const response = await apiClient.put(`/api/links/${linkId}/status`, {
      isDisabled,
      message,
    });
    return response.data;
  },
  updateLink: async ({
    linkId,
    customAddress,
    password,
    expiryDate,
    description,
    domainId,
  }) => {
    const response = await apiClient.put(`/api/links/${linkId}`, {
      customAddress,
      password,
      expiryDate,
      description,
      domainId,
    });

    return response.data;
  },
  deleteLink: async (linkId) => {
    const response = await apiClient.delete(`/api/links/${linkId}`);
    if (response.status === 204) {
      return true;
    }
    throw new Error("Failed to delete link!");
  },
  deleteLinks: async (linkIds) => {
    const response = await apiClient.delete(`/api/links`, {
      data: { linkIds },
    });
    return response.data;
  },
};
