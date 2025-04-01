import { useQuery } from '@tanstack/react-query';

import toast from 'react-hot-toast';
import { APIError } from '../../lib/api/errorHandler';
import { useMessageStore } from '../../store/useMessageStore';

import { useEffect } from 'react';
import { messageAPI } from './api';
import { ConversationResponse } from '../../store/types/conversation-types';

export const useGetMessagesQuery = (conversationId: string) => {

  const { data, error, isLoading, isError, isSuccess } = useQuery<ConversationResponse, APIError>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await messageAPI.getMessages(conversationId);
      return response.data
    },
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
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
  }, [isSuccess, data, conversationId]);

 
  return { data, error, isLoading, isError, isSuccess };
};
