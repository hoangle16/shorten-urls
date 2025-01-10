import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";

// Query keys
export const adminKeys = {
  dashboardOverview: ["dashboardOverview"],
  dashboardChart: (filters) => ["dashboardChart", filters],
};

// Get admin dashboard overview
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: adminKeys.dashboardOverview,
    queryFn: () => adminApi.getAdminDashboardOverview(),
    placeholderData: keepPreviousData,
  });
};

export const useDashboardChart = (filters = {}) => {
  return useQuery({
    queryKey: adminKeys.dashboardChart(filters),
    queryFn: () => adminApi.getAdminDashboardChart(filters),
    select: (data) => {
      return data.links.map((item, index) => ({
        date: item.date,
        links: data.links[index].count,
        clicks: data.clicks[index].count,
        users: data.users[index].count,
        reports: data.reports[index].count,
      }));
    },
    placeholderData: keepPreviousData,
  });
};
