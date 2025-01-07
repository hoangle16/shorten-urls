import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { userApi } from "../api/userApi";

export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (filters) => [...userKeys.lists(), filters],
  details: () => [...userKeys.all, "detail"],
  detail: (id) => [...userKeys.details(), id],
  profile: () => [...userKeys.all, "profile"],
};

export const useUsers = (filters) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userApi.getUsers(filters),
    placeholderData: keepPreviousData,
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: userKeys.profile,
    queryFn: async () => {
      const userInfo = await userApi.getUserProfile();
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      return userInfo;
    },
  });
};

export const useUpdateUser = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateUser,
    onMutate: async (updatedUser) => {
      const previousUser = queryClient.getQueryData(
        userKeys.detail(updatedUser.userId)
      );

      if (!previousUser) {
        return null;
      }

      await queryClient.cancelQueries(userKeys.detail(updatedUser.userId));

      const mergedUser = { ...previousUser, ...updatedUser };

      queryClient.setQueryData(userKeys.detail(updatedUser.userId), mergedUser);

      return { previousUser };
    },
    // onSuccess: (updatedUser) => {
    //   queryClient.invalidateQueries(userKeys.lists());
    //   queryClient.invalidateQueries(userKeys.detail(updatedUser._id));
    // },
    onError: (err, updatedUser, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(
          userKeys.detail(updatedUser.userId),
          context.previousUser
        );
      }
      addToast(
        `Failed to update user ${context.previousUser.username}. Please try again.`,
        {
          variant: "error",
        }
      );
    },
    onSuccess: (data) => {
      addToast("User updated successfully!", {
        variant: "success",
      });
    },
    onSettled: (data, error, updatedUser, context) => {
      queryClient.invalidateQueries(userKeys.lists());
      queryClient.invalidateQueries(userKeys.detail(updatedUser.userId));
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: (data) => {
      console.log(data);
    },
  });
};

export const useDeleteUser = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries(userKeys.lists());
      queryClient.invalidateQueries(userKeys.detail(userId));
      addToast("User deleted successfully!", {
        variant: "success",
      });
    },
    onError: (err) => {
      console.error(err);
      addToast(
        err?.response?.data?.message ||
          "Failed to delete user. Please try again.",
        {
          variant: "error",
        }
      );
      throw err;
    },
  });
};

export const useDeleteUsers = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUsers,
    onSuccess: (_, userIds) => {
      queryClient.invalidateQueries(userKeys.lists());

      userIds.forEach((userId) =>
        queryClient.invalidateQueries(userKeys.detail(userId))
      );
      addToast("Users deleted successfully!", {
        variant: "success",
      });
    },
    onError: (err) => {
      console.error(err);
      addToast(
        err?.response?.data?.message ||
          "Failed to delete users. Please try again.",
        {
          variant: "error",
        }
      );
    },
  });
};
