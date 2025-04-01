import { AxiosResponse } from "axios";
import { axiosInstance } from "../../lib/api/client";

export const usersAPI = {
  getUsers: async (): Promise<AxiosResponse> => {
    const response = await axiosInstance.get("/users")
    return response
  },
};