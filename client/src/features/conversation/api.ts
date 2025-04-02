import { axiosInstance } from "../../lib/api/client";
import { ConversationResponse } from "../../store/types/conversation-types";
import { APIError } from "../../lib/api/errorHandler";

export const conversationAPI = {
  fetchConversation: async (chatPartnerId: string): Promise<ConversationResponse | null> => {
    try {
      const response = await axiosInstance.get(`/conversation/?partnerId=${chatPartnerId}`);
      return response.data;
    } catch (error) {
      if ((error as APIError).status === 404) return null;
      throw error
    }
  },
  createConversation: async(chatPartnerId: string): Promise<ConversationResponse> => {
    const response = await axiosInstance.post(`/conversation`, { participantId: chatPartnerId })
    return response.data
  }
};