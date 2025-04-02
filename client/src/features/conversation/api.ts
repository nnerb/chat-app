import { axiosInstance } from "../../lib/api/client";
import { ConversationResponse } from "../../store/types/conversation-types";

export interface GetConversationVariables {
  userId: string,
  navigate: (path: string) => void
}

export const conversationAPI = {
  getConversation: async ({
    userId 
  }: GetConversationVariables ): Promise<ConversationResponse> => {
    const response = await axiosInstance.get(`/conversation/${userId}`)
    return response.data
  },
};