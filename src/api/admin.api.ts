import api from "./axios";

import type { AdminLoginData,AdminLoginResponse,AdminUsersResponse } from "../features/admin/types/admin.types";

export const adminLogin = async(
    data:AdminLoginData,
):Promise<AdminLoginResponse>=>{
    const response = await api.post('/admin/login',data);
    return response.data;
}

export const getAdminUsers = async (
  page = 1,
  limit = 10
): Promise<AdminUsersResponse> => {
  const response = await api.get('/admin/users', {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};