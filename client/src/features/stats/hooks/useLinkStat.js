import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { statApi } from "../api/statApi";

export const statKeys = {
  all: ["stats"],
  lists: () => [...statKeys.all, "list"],
  list: (filters) => [...statKeys.lists(), filters],
};

export const useLinkStatList = (filters) => {
  return useQuery({
    queryKey: statKeys.list(filters),
    queryFn: () => statApi.getStatListByLinkId(filters),
    placeholderData: keepPreviousData,
  });
};

export const useDeleteStat = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: statApi.deleteStatById,
    onSuccess: (_, statId) => {
      queryClient.invalidateQueries(statKeys.lists());
      addToast("Stat deleted successfully!", { variant: "success" });
    },
    onError: (err) => {
      console.error("Failed to delete stat", err);
      addToast(
        err?.response?.data?.message ||
          "Failed to delete stat. Please try again.",
        { variant: "error" }
      );
    },
  });
};

export const useDeleteStats = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: statApi.deleteStats,
    onSuccess: (_, statIds) => {
      queryClient.invalidateQueries(statKeys.lists());
      addToast("Stats deleted successfully!", { variant: "success" });
    },
    onError: (err) => {
      console.error("Failed to delete stats", err);
      addToast(
        err?.response?.data?.message ||
          "Failed to delete stats. Please try again.",
        { variant: "error" }
      );
    },
  });
};
