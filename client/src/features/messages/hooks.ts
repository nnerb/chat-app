import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { APIError } from '../../lib/api/errorHandler';
import { useMessageStore } from '../../store/useMessageStore';
import { useEffect } from 'react';
import { messageAPI } from './api';
import { MessageResponse } from '../../store/types/conversation-types';
import { createTemporaryMessage } from '../../lib/utils';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';


export const useGetMessagesQuery = (conversationId: string) => {
  const { data, error, isLoading, isError, isSuccess } = useQuery<MessageResponse, APIError>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await messageAPI.getMessages(conversationId);
      return response
    },
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
    staleTime: 300000
  });

  useEffect(() => {
    if (isError && error) {
      const apiError = error
      useMessageStore.setState({ validConversationId: false });
      toast.error(apiError.message);
    }
  }, [isError, error]);

  useEffect(() => {
    if (isSuccess && data) {
      const { hasMore, currentPage, messages, selectedUser, conversation } = data;
      useMessageStore.setState(() => {
        return {
          messages,
          selectedUser,
          conversation,
          validConversationId: true,
          hasMoreMessages: hasMore,
          currentPage,
        };
      });
    }
  }, [isSuccess, data]);

  return { data, error, isLoading, isError, isSuccess };
};

export const useSendMessageQuery = () => {
  const queryClient = useQueryClient();
  const { setIsSendingMessage } = useMessageStore();
  return useMutation({
    onMutate: async (variables) => {
      setIsSendingMessage(true)
      const { selectedUser, messageData } = variables;
      const userId = useAuthStore.getState().authUser?._id;
      if (!selectedUser || !userId) return;
      const previousMessage = useMessageStore.getState().messages
      // create a temporary message with { isTemporary: true } field
      const temporaryMessage = createTemporaryMessage(messageData, userId, selectedUser._id);
      useUserStore.setState((state) => {
        const { conversationId, text } = messageData
        const updatedUsers = state.users.map((user) => {
          if (user.conversationId === conversationId) {
            return {
              ...user,
              lastMessage: {
                content: text || "[Image]",
                sender: userId,
                timestamp: new Date().toISOString()
              },
            };
          }
            return user;
          })
        const sortedUsers = updatedUsers.sort((a, b) => {
          const timeA = new Date(a.lastMessage?.timestamp || 0).getTime();
          const timeB = new Date(b.lastMessage?.timestamp || 0).getTime();
          return timeB - timeA; // Descending order (latest first)
        });
        return { users: sortedUsers}
      })
      useMessageStore.setState((state) => {
        return {
          currentPage: state.currentPage,
          text: "",
          messages: [...state.messages, temporaryMessage],
        }
      });
      return { previousMessage }
    },
    mutationFn: messageAPI.sendMessage,
    onSuccess: (data, variables) => {
      // Invalidate the messages query for the conversation, forcing a refetch
      const { conversationId } = variables.messageData;
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      const { newMessage } = data
      useMessageStore.setState((state) => {
        const filteredMessages = state.messages.filter((message) => !message.isTemporary)
        const updatedMessages = [...filteredMessages, newMessage]
        return { messages: updatedMessages }
      })
    },
    onError: (error, _, context) => {
      toast.error(error.message)
      console.error(error.message);
      if (context?.previousMessage) {
        useMessageStore.setState({ messages: context.previousMessage })
      }
    },
    onSettled: () => setIsSendingMessage(false)
  });
}
