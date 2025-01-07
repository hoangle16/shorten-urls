import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { domainApi } from "../api/domainApi";

export const domainKeys = {
  all: ["domains"],
  lists: () => [...domainKeys.all, "lists"],
  list: (filters) => [...domainKeys.lists(), "list", filters],
  details: () => [...domainKeys.all, "detail"],
  detail: (id) => [...domainKeys.details(), id],
};

// TODO: filters
export const useDomains = (filters = {}) => {
  return useQuery({
    queryKey: domainKeys.list(filters),
    queryFn: () => domainApi.getDomains(),
    placeholderData: keepPreviousData,
  });
};

export const useDomain = (id) => {
  return useQuery({
    queryKey: domainKeys.detail(id),
    queryFn: () => domainApi.getDomain(id),
    enabled: !!id,
  });
};

export const useCreateDomain = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: domainApi.createDomain,
    onError: (err) => {
      addToast("Failed to create domain. Please try again.", {
        variant: "error",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(domainKeys.lists());
      addToast("Domain created successfully!", {
        variant: "success",
      });
    },
  });
};

export const useUpdateDomain = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: domainApi.updateDomain,
    onError: (err) => {
      addToast("Failed to create domain. Please try again.", {
        variant: "error",
      });
    },
    onSuccess: (data) => {
      addToast("Domain created successfully!", {
        variant: "success",
      });
    },
    onSettled: (data, error, updatedDomain) => {
      queryClient.invalidateQueries(domainKeys.lists());
      queryClient.invalidateQueries(domainKeys.detail(updatedDomain.domainId));
    },
  });
};

export const useDeleteDomain = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: domainApi.deleteDomain,
    onSuccess: (_, domainId) => {
      queryClient.invalidateQueries(domainKeys.lists());
      queryClient.invalidateQueries(domainKeys.detail(domainId));
      addToast("Domain deleted successfully!", {
        variant: "success",
      });
    },
    onError: (err) => {
      console.error(err);
      addToast(
        err?.response?.data?.message ||
          "Failed to delete domain. Please try again.",
        {
          variant: "error",
        }
      );
      throw err;
    },
  });
};

// TODO: useDeleteDomains
