import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { linkApi } from "../api/linkApi";

export const linkKeys = {
  all: ["links"],
  lists: () => [...linkKeys.all, "list"],
  list: (filters) => [...linkKeys.lists(), filters],
  details: () => [...linkKeys.all, "detail"],
  detail: (id) => [...linkKeys.details(), id],
};

export const useLinks = (filters) => {
  return useQuery({
    queryKey: linkKeys.list(filters),
    queryFn: () => linkApi.getLinks(filters),
    placeholderData: keepPreviousData,
  });
};

export const useLink = (id) => {
  return useQuery({
    queryKey: linkKeys.detail(id),
    queryFn: () => linkApi.getLinkById(id),
    enabled: !!id,
  });
};

export const useUpdateLinkStatus = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: linkApi.updateLinkStatus,
    onError: (err) => {
      console.error("Failed to update link status", err);
      addToast(
        err?.response?.data?.message ||
          "Failed to update link status. Please try again.",
        { variant: "error" }
      );
    },
    onSuccess: (_, { linkId }) => {
      addToast("Link status updated successfully", { variant: "success" });
      queryClient.invalidateQueries(linkKeys.lists());
      queryClient.invalidateQueries(linkKeys.detail(linkId));
    },
  });
};

export const useUpdateLink = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: linkApi.updateLink,
    onError: (err, updatedLink) => {
      console.error("Failed to update link", err);
      addToast(
        err?.response?.data?.message ||
          "Failed to update link. Please try again.",
        { variant: "error" }
      );
    },
    onSuccess: (data) => {
      addToast("Link updated successfully", { variant: "success" });
    },
    onSettled: (data, err, updatedLink) => {
      queryClient.invalidateQueries(linkKeys.lists());
      queryClient.invalidateQueries(linkKeys.detail(updatedLink.linkId));
    },
  });
};

export const useDeleteLink = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: linkApi.deleteLink,
    onSuccess: (_, linkId) => {
      queryClient.invalidateQueries(linkKeys.lists());
      queryClient.invalidateQueries(linkKeys.detail(linkId));
      addToast("Link deleted successfully!", { variant: "success" });
    },
    onError: (err) => {
      console.error("Failed to delete link", err);
      addToast(
        err?.response?.data?.message ||
          "Failed to delete link. Please try again.",
        { variant: "error" }
      );
    },
  });
};

export const useDeleteLinks = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: linkApi.deleteLinks,
    onSuccess: (_, linkIds) => {
      queryClient.invalidateQueries(linkKeys.lists());

      linkIds.forEach((linkId) =>
        queryClient.invalidateQueries(linkKeys.detail(linkId))
      );
      addToast("Links deleted successfully!", { variant: "success" });
    },
    onError: (err) => {
      console.error("Failed to delete links", err);
      addToast(
        err?.response?.data?.message ||
          "Failed to delete links. Please try again.",
        { variant: "error" }
      );
    },
  });
};
