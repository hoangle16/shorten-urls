import apiClient from "../../../utils/apiClient";
import { generateQueryURL } from "../../../utils/helper";

const BASE_URL = "/api/reports";

export const reportApi = {
  createReport: async ({ linkId, shortUrl, type, description }) => {
    const response = await apiClient.post(BASE_URL, {
      linkId,
      shortUrl,
      type,
      description,
    });
    return response.data;
  },
  getReports: async ({
    search,
    status,
    type,
    sortBy,
    sortOrder,
    page,
    limit,
  }) => {
    const url = generateQueryURL(BASE_URL, {
      search,
      status,
      type,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    const response = await apiClient.get(url);
    return response.data;
  },
  getReportsByLinkId: async (linkId) => {
    const response = await apiClient.get(`${BASE_URL}/link/${linkId}`);
    return response.data;
  },
  getReportById: async (reportId) => {
    const response = await apiClient.get(`${BASE_URL}/${reportId}`);
    return response.data;
  },
  updateReportStatus: async ({
    reportId,
    status,
    action,
    isChangeRelated,
    adminNotes,
  }) => {
    const response = await apiClient.put(`${BASE_URL}/${reportId}`, {
      status,
      action,
      isChangeRelated,
      adminNotes,
    });
    return response.data;
  },
  getReportStats: async () => {
    const response = await apiClient.get(`${BASE_URL}/stats`);
    return response.data;
  },
  deleteReport: async (reportId) => {
    const response = await apiClient.delete(`${BASE_URL}/${reportId}`);
    return response.data;
  },
  deleteReports: async (reportIds) => {
    const response = await apiClient.delete(`${BASE_URL}`, {
      data: { reportIds },
    });
    return response.data;
  },
};
