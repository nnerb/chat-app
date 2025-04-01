import { AxiosResponse } from "axios";
import { axiosInstance } from "../../lib/api/client";

export const messageAPI = {
  getMessages: async (conversationId: string): Promise<AxiosResponse> => {
    const response = await axiosInstance.get(`/messages/${conversationId}`)
    return response
  },
};