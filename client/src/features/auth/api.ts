import { axiosInstance } from "../../lib/api/client";
import { AuthUser } from "../../store/useAuthStore";
import { FormDataProps, LoginDataProps } from "../../types";

export const authAPI = {
  checkAuth: async (): Promise<AuthUser> => {
    const response = await axiosInstance.get('/auth/check')
    return response.data
  },
  signup: async (data: FormDataProps): Promise<AuthUser> => {
    const response = await axiosInstance.post('/auth/signup', data)
    return response.data
  },
  login: async (data: LoginDataProps): Promise<AuthUser> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },
  logout: async (userId: string): Promise<void> => {
    const response = await axiosInstance.post(`/auth/logout/${userId}`);
    return response.data;
  },
};