
import { axiosInstance } from "../../lib/api/client";
import { MessageDataProps } from "../../types";
import { AuthUser } from "../../store/useAuthStore";
import { SendMessageProps } from "../../store/types/message-types";
import { MessageResponse } from "../../store/types/conversation-types";

interface SendMessageVariables {
  messageData: MessageDataProps,
  selectedUser: AuthUser | null
}

export const messageAPI = {
  getMessages: async (conversationId: string): Promise<MessageResponse> => {
    const response = await axiosInstance.get(`/messages/${conversationId}`)
    return response.data
  },
  sendMessage: async ({
    messageData,
    selectedUser
  }: SendMessageVariables): Promise<SendMessageProps> => {
    const response = await axiosInstance.post(`/messages/send/${selectedUser?._id}`, messageData);
    return response.data
  }
};