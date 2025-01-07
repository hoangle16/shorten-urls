import apiClient from "../../../utils/apiClient";
import { generateQueryURL } from "../../../utils/helper";

export const statApi = {
  getStatsByLinkId: async ({
    linkId,
    startDate,
    endDate,
    groupBy = "date",
  }) => {
    const url = generateQueryURL(`/api/link-stats/by-link/${linkId}`, {
      startDate,
      endDate,
      groupBy,
    });

    const response = await apiClient.get(url);
    return response.data;
  },
  getStatListByLinkId: async ({
    linkId,
    os,
    browser,
    country,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    page,
    limit,
  }) => {
    const url = generateQueryURL(`/api/link-stats/list/${linkId}`, {
      os,
      browser,
      country,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    const response = await apiClient.get(url);
    return response.data;
  },
  getClickStatsByUser: async (startDate = null, endDate = null) => {
    const url = generateQueryURL("/api/link-stats/by-user/clicks", {
      startDate,
      endDate,
    });

    const response = await apiClient.get(url);
    return response.data;
  },
  getStatsByUser: async ({
    os,
    browser,
    country,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    page,
    limit,
  } = {}) => {
    const url = generateQueryURL("/api/link-stats/by-user/stats", {
      os,
      browser,
      country,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    const response = await apiClient.get(url);
    return response.data;
  },

  deleteStatById: async (statId) => {
    const response = await apiClient.delete(`/api/stats/${statId}`);
    return response.data;
  },

  deleteStats: async (statIds) => {
    const response = await apiClient.delete(`/api/stats`, {
      data: { statIds },
    });
    return response.data;
  },
};
