import apiClient from "../../../utils/apiClient";
import { generateQueryURL } from "../../../utils/helper";

const BASE_URL = "/api/users";

export const userApi = {
  getUsers: async ({
    search,
    isVerify,
    role,
    sortBy,
    sortOrder,
    limit,
    page,
  } = {}) => {
    const url = generateQueryURL(BASE_URL, {
      search,
      isVerify,
      role,
      sortBy,
      sortOrder,
      limit,
      page,
    });
    const response = await apiClient.get(url);
    return response.data;
  },
  getUser: async (userId) => {
    const response = await apiClient.get(`${BASE_URL}/${userId}`);
    return response.data;
  },
  getUserProfile: async () => {
    const response = await apiClient.get(`${BASE_URL}/profile`);
    return response.data;
  },
  updateUser: async ({ userId, firstName, lastName, isVerify, role }) => {
    const response = await apiClient.put(`${BASE_URL}/${userId}`, {
      firstName,
      lastName,
      isVerify,
      role,
    });
    return response.data;
  },
  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    const response = await apiClient.post(`${BASE_URL}/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`${BASE_URL}/${userId}`);
    return response.data;
  },

  deleteUsers: async (userIds) => {
    const response = await apiClient.delete(`${BASE_URL}`, {
      data: {
        userIds,
      },
    });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await apiClient.get(`${BASE_URL}/verify?token=${token}`);
    return response.data;
  },
  resendVerifyEmail: async (email) => {
    const response = await apiClient.post(`${BASE_URL}/reverify`, { email });
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await apiClient.post(`${BASE_URL}/forgot-password`, {
      email,
    });
    return response.data;
  },
  checkForgotPasswordToken: async (token) => {
    const response = await apiClient.get(
      `${BASE_URL}/check-forgot-password?token=${token}`
    );
    return response.data;
  },
  resetPassword: async (token, password, confirmPassword) => {
    const response = await apiClient.post(
      `${BASE_URL}/reset-password?token=${token}`,
      { password, confirmPassword }
    );
    return response.data;
  },
};
