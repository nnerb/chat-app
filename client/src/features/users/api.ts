import { axiosInstance } from "../../lib/api/client";
import { IUserSidebar } from "../../store/types/message-types";

export interface GetUsersResponse {
  usersWithLastMessage: IUserSidebar[]
}

export const usersAPI = {
  getUsers: async (): Promise<GetUsersResponse> => {
    const response = await axiosInstance.get("/users")
    return response.data
  },
};