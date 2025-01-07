import apiClient from "../../../utils/apiClient"
import { generateQueryURL } from "../../../utils/helper";

export const adminApi = {
  getAdminDashboardOverview: async () => {
    const response = await apiClient.get("/api/admin/dashboard/overview");
    return response.data;
  },
  getAdminDashboardChart: async ({range="day", startDate, endDate}) => {
    const url = generateQueryURL("/api/admin/dashboard/chart", {range, startDate, endDate});

    const response = await apiClient.get(url);
    return response.data;
  }
}