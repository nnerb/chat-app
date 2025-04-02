import { useMutation, useQueryClient } from "@tanstack/react-query"
import { conversationAPI } from "./api"
import { useNavigate } from "react-router-dom";
import { APIError } from "../../lib/api/errorHandler";
import { ConversationResponse } from "../../store/types/conversation-types";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";

export const useConversationQuery = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authUser } = useAuthStore()
  const currentUserId = authUser?._id

  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
  const CACHE_KEY_PREFIX = 'conversation';

  return useMutation<ConversationResponse, APIError, string>({
    mutationFn: async (chatPartnerId) => {
      const cached = queryClient.getQueryData<{ 
        data: ConversationResponse; 
        updatedAt: number 
      }>([CACHE_KEY_PREFIX, chatPartnerId]);

      if (cached && (Date.now() - cached.updatedAt < CACHE_TTL_MS )) {
        return cached.data;
      }
      const existing = await conversationAPI.fetchConversation(chatPartnerId);
      return existing ?? conversationAPI.createConversation(chatPartnerId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        [CACHE_KEY_PREFIX, data.participants.find(id => id !== currentUserId)],
        {
          data,
          updatedAt: Date.now()
        }
      )
      navigate(`/messages/${data._id}`);
    },
    onError: (error) => {
      console.log(error)
      toast.error(error.message)
    },
  });
}