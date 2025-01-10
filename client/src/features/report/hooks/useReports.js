import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { reportApi } from "../api/reportApi";

export const reportKeys = {
  all: ["reports"],
  lists: () => [...reportKeys.all, "list"],
  list: (filters) => [...reportKeys.lists(), filters],
  listByLink: (linkId) => [...reportKeys.lists(), "link", linkId],
  details: () => [...reportKeys.all, "detail"],
  detail: (id) => [...reportKeys.details(), id],
  stats: () => [...reportKeys.all, "stats"],
};

export const useReports = (filters = {}) => {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => reportApi.getReports(filters),
    placeholderData: keepPreviousData,
  });
};

export const useReportsByLinkId = (linkId) => {
  return useQuery({
    queryKey: reportKeys.listByLink(linkId),
    queryFn: () => reportApi.getReportsByLinkId(linkId),
    enabled: !!linkId,
    placeholderData: keepPreviousData,
  });
};

export const useReportById = (id) => {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportApi.getReportById(id),
    select: (data) => ({
      ...data,
      link: data.linkId,
      reportedBy: data.reportedBy?.username,
      resolvedBy: data.resolvedBy?.username,
    }),
    enabled: !!id,
  });
};

export const useReportStats = () => {
  return useQuery({
    queryKey: reportKeys.stats(),
    queryFn: () => reportApi.getReportStats(),
    placeholderData: keepPreviousData,
  });
};

export const useCreateReport = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportApi.createReport,
    onError: (err, variables, context, mutation) => {
      if (!mutation.options.skipDefaultOnError) {
        addToast(
          err.response?.data?.message ||
            "Failed to send report. Please try again.",
          {
            variant: "error",
          }
        );
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(reportKeys.lists());
      queryClient.invalidateQueries(reportKeys.listByLink(data._id));
      addToast("Report sent successfully!", {
        variant: "success",
      });
    },
  });
};

export const useUpdateReportStatus = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportApi.updateReportStatus,
    onError: (err) => {
      addToast(
        err.response?.data?.message ||
          "Failed to update report status. Please try again.",
        {
          variant: "error",
        }
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(reportKeys.lists());
      queryClient.invalidateQueries(reportKeys.listByLink(data._id));
      queryClient.invalidateQueries(reportKeys.detail(data._id));
      addToast("Report status updated successfully!", {
        variant: "success",
      });
    },
  });
};

export const useDeleteReport = (addToast) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportApi.deleteReport,
    onError: (err) => {
      addToast(
        err.response?.data?.message ||
          "Failed to delete the report. Please try again!",
        {
          variant: "error",
        }
      );
    },
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries(reportKeys.lists());
      queryClient.invalidateQueries(reportKeys.listByLink(reportId));
      queryClient.invalidateQueries(reportKeys.detail(reportId));
      addToast("Report deleted successfully!", {
        variant: "success",
      });
    },
  });
};

export const useDeleteReports = (addToast) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportApi.deleteReports,
    onError: (err) => {
      addToast(
        err.response?.data?.message ||
          "Failed to delete reports. Please try again!",
        {
          variant: "error",
        }
      );
    },
    onSuccess: (_, reportIds) => {
      queryClient.invalidateQueries(reportKeys.lists());
      reportIds?.map((reportId) => {
        queryClient.invalidateQueries(reportKeys.listByLink(reportId));
        queryClient.invalidateQueries(reportKeys.detail(reportId));
      });
      addToast("Reports deleted successfully!", {
        variant: "success",
      });
    },
  });
};
