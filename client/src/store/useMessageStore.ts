import axios from "axios";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AuthUser, useAuthStore } from "./useAuthStore";
import { AIGeneratedResponseProps, MessageDataProps } from "../types";
import {  FetchMoreMessagesProps, IUserSidebar, MessagesProps, SendMessageProps } from "./types/message-types";
import { ConversationProps, ConversationResponse } from "./types/conversation-types";
import { getFromCache, updateCache } from "../lib/utils";

interface CachedMessages {
  messages: MessagesProps[];
  timestamp: number;
  selectedUser: AuthUser | null;
  hasMoreMessages: boolean | null;
  currentPage: number;
}

interface CachedUsers {
  users: IUserSidebar[];
  timestamp: number;
}

interface CachedConversation {
  conversation: ConversationProps;
  timestamp: number;
}

interface CachedAIResponses {
  replyOptions: string[];
  timestamp: number;
}
interface UseMessageStoreProps {
  text: string;
  setText:  (text: string | ((prevText: string) => string)) => void;
  messages: MessagesProps[];
  setMessages: (messages: MessagesProps[]) => void
  cachedMessages: Map<string, CachedMessages>;
  users: IUserSidebar[];
  selectedUser: AuthUser | null;
  isUsersLoading: boolean;
  isConversationLoading: boolean;
  isMessagesLoading: boolean;
  conversation: ConversationProps | null;
  validConversationId: boolean | null;
  conversationIds: string[] | null;
  currentPage: number;
  hasMoreMessages: boolean | null;
  isFetchingMoreMessages: boolean;
  aiGeneratedResponse: string[] | null;
  isGeneratingAIResponse: boolean;
  aiGeneratedRepliesCount: number;
  selectedMessageId: string | null;
  cachedAIResponses: Map<string, CachedAIResponses>;
  cachedConversation: Map<string, CachedConversation>;
  cachedUsers: Map<string, CachedUsers>
  isSubscribed: boolean;
  resetMessages: () => void;
  getUsers: () => Promise<void>;
  getConversation: (selectedUser: IUserSidebar | null, navigate: (path: string) => void) => Promise<void>;
  fetchMoreMessages: (conversationId: string, currentPage: number) => Promise<void>
  getMessages: (conversationId: string) => Promise<void>;
  sendMessage: (messageData: MessageDataProps) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeToMessages: () => void;
  subscribeToLastMessage: () => void;
  unsubscribeToLastMessage: () => void;
  generateAIResponse: (data: AIGeneratedResponseProps, regenerate?: boolean) => Promise<void>
}

export const useMessageStore = create<UseMessageStoreProps>((set, get) => ({
  text: "",
  setText: (text) => set((state) => ({ text: typeof text === "function" ? text(state.text) : text })),
  messages: [],
  cachedMessages: new Map(),
  setMessages: (messages) => set({ messages }),
  resetMessages: () => set({ messages: [], selectedUser: null }),
  users: [],
  selectedUser: null,
  isConversationLoading: false,
  isUsersLoading: false,
  isMessagesLoading: false,
  conversation: null,
  validConversationId: null,
  conversationIds: null,
  currentPage: 1,
  hasMoreMessages: null,
  aiGeneratedResponse: null,
  aiGeneratedRepliesCount: 0,
  isFetchingMoreMessages: false,
  isGeneratingAIResponse: false,
  selectedMessageId: null,
  cachedAIResponses: new Map(),
  cachedConversation: new Map(),
  cachedUsers: new Map(),
  isSubscribed: false,
  getUsers: async () => {
    const userId = useAuthStore.getState().authUser?._id
    if (!userId) return

    const { cachedUsers } = get()
    const cachedData = getFromCache(cachedUsers, userId);

    if (cachedData) {
      set({ users: cachedData.users });
      return;
    }
  
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      const users = res.data

      set((state) => {
        const newCache = updateCache(state.cachedUsers, userId, {
          users,
          timestamp: Date.now(),
        })
        return { users: res.data, cachedUsers: newCache }
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
      // Narrowing the type of error to AxiosError
        const errorMessage = error.response?.data?.message || 'An error occurred while getting the users';
        toast.error(errorMessage);
      } else {
        // Handle non-Axios errors
        toast.error('An unexpected error occurred');
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getConversation: async (selectedUser, navigate) => {
    if (!selectedUser?._id) return;
    const { cachedConversation } = get()
    const userId = selectedUser._id
    const cachedData = getFromCache(cachedConversation, userId);

    if (cachedData) {
      set({ conversation: cachedData.conversation })
      navigate(`/messages/${cachedData.conversation._id}`);
      return
    }

    set({ isConversationLoading: true });
    try {
      // Fetch or create conversation with the selected user
      const res = await axiosInstance.get(`/conversation/${userId}`);
      const { conversation } : ConversationResponse = res.data

      if (!conversation) {
        toast.error("Failed to retrieve conversation.")
        return;
      }

      set((state) => {
        const newCache = updateCache(state.cachedConversation, userId, {
          conversation,
          timestamp: Date.now()
        })
        return {
          conversation,
          validConversationId: true,
          cachedConversation: newCache
        };
      })
      
      navigate(`/messages/${conversation._id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Failed to fetch conversation.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      set({ isConversationLoading: false });
    }
  },
  getMessages: async (conversationId) => {

    const { cachedMessages } = get();
    const cachedData = getFromCache(cachedMessages, conversationId)

    if (cachedData) {
      set({
        messages: cachedData.messages, 
        selectedUser: cachedData.selectedUser,
        hasMoreMessages: cachedData.hasMoreMessages,
        currentPage: cachedData.currentPage,
      });
      return;
    }

    set({ isMessagesLoading : true });
    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`);
      const { 
        hasMore, 
        currentPage, 
        messages, 
        selectedUser, 
        conversation 
      } : ConversationResponse = res.data;
      set((state) => {
        const newCache = updateCache(state.cachedMessages, conversationId, {
          messages,
          selectedUser,
          hasMoreMessages: hasMore,
          currentPage,
          timestamp: Date.now()
        });
        return { 
          cachedMessages: newCache,
          messages,
          selectedUser,
          conversation,
          validConversationId: true,
          hasMoreMessages: hasMore,
          currentPage
        };
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Narrowing the type of error to AxiosError
        const errorMessage = error.response?.data?.message || 'An error occurred while fetching messages';
        console.error(errorMessage);
        set({ validConversationId: false })
      } else {
        // Handle non-Axios errors
        toast.error('An unexpected error occurred');
        set({ validConversationId: false })
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  fetchMoreMessages: async (conversationId, currentPage) => {
    set({ isFetchingMoreMessages: true });
    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`, {
        params: { page: currentPage + 1, limit: 10 },
      });
      const { messages, hasMore } : FetchMoreMessagesProps = res.data
      set((state) => {
        const mergedMessages = [...messages, ...state.messages];

        const dedupedMessages= mergedMessages.reduce<MessagesProps[]>((acc, message) => {
          if (!acc.find((m) => m._id === message._id)) {
            acc.push(message);  
          }
          return acc;
        }, []);
        return {
          messages: dedupedMessages,
          currentPage: currentPage + 1,
          hasMoreMessages: hasMore
        }
      });
    } catch (error) {
      console.error("Failed to fetch more messages:", error);
      toast.error("Failed to load older messages.");
    } finally {
      set({ isFetchingMoreMessages: false });
    }
  }, 
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const { conversationId } = messageData;
    const userId = useAuthStore.getState().authUser?._id;
    if (!selectedUser?._id || !conversationId || !userId) return;

    // Optimistically update the sidebar for the sender
    set((state) => {
      const updatedUsers = state.users.map((user) => {
        if (user.conversationId === conversationId) {
          return {
            ...user,
            lastMessage: {
              content: messageData.text || "[Image]",
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
      return { users: sortedUsers, currentPage: state.currentPage }  
    });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const { messages, newMessage } : SendMessageProps = res.data
      set((state) => {
        const updatedMessages = [...state.messages, newMessage]
        console.log("Messages", messages)
        return { 
            cachedMessages: new Map(state.cachedMessages).set(conversationId, {
            messages: updatedMessages,
            selectedUser: state.selectedUser,
            hasMoreMessages: state.hasMoreMessages,
            currentPage: state.currentPage,
            timestamp: Date.now()
          }),
          messages: updatedMessages
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Narrowing the type of error to AxiosError
        const errorMessage = error.response?.data?.message || 'An error occurred while sending the message';
        toast.error(errorMessage);
      } else {
        // Handle non-Axios errors
        toast.error('An unexpected error occurred');
      }
    }
  },
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.log("[Socket] No socket connection found");
      return;
    }
    console.log("[Socket] Subscribing to messages...");
    socket?.on("newMessage", (newMessage: MessagesProps) => {
      const userId = useAuthStore.getState().authUser?._id;
      const { conversation } = get();
  
      // Check if the message is intended for the current user
      if (newMessage.receiverId !== userId) return;
  
      // Determine if the message belongs to the currently viewed conversation
      const isCurrentConversation = newMessage.conversationId === conversation?._id;
  
      set((state) => {
        const conversationId = newMessage.conversationId;
        const existingCache = state.cachedMessages.get(conversationId);
  
        // Update the cache for the conversation
        const newCachedMessages = new Map(state.cachedMessages);
        if (existingCache) {
          const updatedMessages = [...existingCache.messages, newMessage];
          newCachedMessages.set(conversationId, {
            ...existingCache,
            messages: updatedMessages,
            timestamp: Date.now()
          });
        } else {
          // Create a new cache entry if none exists (though unlikely)
          newCachedMessages.set(conversationId, {
            messages: [newMessage],
            selectedUser: null,
            hasMoreMessages: null,
            currentPage: 1,
            timestamp: Date.now()
          });
        }
  
        // Update messages state only if it's the current conversation
        const updatedMessages = isCurrentConversation
          ? [...state.messages, newMessage]
          : state.messages;
  
        return {
          messages: updatedMessages,
          cachedMessages: newCachedMessages,
        };
      });
    });
  },
  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket
    socket?.off("newMessage")
  },
  subscribeToLastMessage: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.log("[Socket] No socket connection found");
      return;
    }
    console.log("[Socket] Subscribing to last message...");
    socket?.on("lastMessage", (newMessage: MessagesProps) => {
      set((state) => {
        const updatedUsers = state.users.map((user) => {
          if (user.conversationId === newMessage.conversationId) {
            return {
              ...user,
              lastMessage: {
                content: newMessage.text || "[Image]", // Handle image content if needed
                sender: newMessage.senderId,
                timestamp: newMessage.createdAt,
              },
            };
          }
          return user;  // Ensure all users are returned, not just the updated one
        });
        const sortedUsers = updatedUsers.sort((a, b) => {
          const timeA = new Date(a.lastMessage?.timestamp || 0).getTime();
          const timeB = new Date(b.lastMessage?.timestamp || 0).getTime();
          return timeB - timeA; // Descending order (latest first)
        });
        return {
          users: sortedUsers,  // Add the new message to the messages array
        };
      });
    });
  },
  unsubscribeToLastMessage: () => {
    const socket = useAuthStore.getState().socket
    socket?.off("lastMessage")
  },
  generateAIResponse: async (data, regenerate) => {
    const modal = document.getElementById("my_modal_2");     
    set({ isGeneratingAIResponse: true })
    try {
      const { cachedAIResponses } = get()
      const cacheKey = `${data.conversationId}-${data.selectedMessageId}`;
      const cachedData = getFromCache(cachedAIResponses, cacheKey);

      if (!regenerate && cachedData) {
        set({ aiGeneratedResponse: cachedData.replyOptions, selectedMessageId: data.selectedMessageId });
        return;
      }

      const res = await axiosInstance.post(`/messages/generate-reply`, data);
      const { replyOptions, updatedAiGeneratedRepliesCount } = res.data
      set((state) => {
        const newCache = updateCache(state.cachedAIResponses, cacheKey, {
          replyOptions,
          timestamp: Date.now()
        })
        return {
          cachedAIResponses: newCache,
          aiGeneratedResponse: replyOptions,
          aiGeneratedRepliesCount: updatedAiGeneratedRepliesCount,
          selectedMessageId: data.selectedMessageId,
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Narrowing the type of error to AxiosError
        if (modal) (modal as HTMLDialogElement).close(); 
        const errorMessage = error.response?.data?.message || 'An error occurred while generating ai message';
        toast.error(errorMessage);
      } else {
        // Handle non-Axios errors
        if (modal) (modal as HTMLDialogElement).close(); 
        toast.error('An unexpected error occurred');
      }
    } finally {
      set({ isGeneratingAIResponse: false })
    }
  },
})) 