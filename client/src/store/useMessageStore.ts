import axios from "axios";
import { create } from "zustand";
import { axiosInstance } from "../lib/api/client";
import toast from "react-hot-toast";
import { AuthUser, useAuthStore } from "./useAuthStore";
import { AIGeneratedResponseProps, MessageDataProps } from "../types";
import { FetchMoreMessagesProps, IUserSidebar, MessagesProps, SendMessageProps } from "./types/message-types";
import { ConversationProps, ConversationResponse } from "./types/conversation-types";
import { createTemporaryMessage, getFromCache, updateCache } from "../lib/utils";

export interface CachedMessages {
  messages: MessagesProps[];
  timestamp: number;
  selectedUser: AuthUser | null;
  hasMoreMessages: boolean | null;
  currentPage: number;
}

export interface CachedUsers {
  users: IUserSidebar[];
  timestamp: number;
}

export interface CachedConversation {
  conversation: ConversationProps;
  timestamp: number;
}

export interface CachedAIResponses {
  replyOptions: string[];
  timestamp: number;
}
interface UseMessageStoreProps {
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  text: string;
  setText: (text: string | ((prevText: string) => string)) => void;
  messages: MessagesProps[];
  cachedMessages: Map<string, CachedMessages>;
  users: IUserSidebar[];
  selectedUser: AuthUser | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  setIsMessagesLoading: (status: boolean) => void
  isSendingMessage: boolean;
  setIsSendingMessage: (status: boolean) => void;
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
  activeConversationId: "",
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  text: "",
  setText: (text) => set((state) => ({ text: typeof text === "function" ? text(state.text) : text })),
  messages: [],
  cachedMessages: new Map(),
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: true,
  setIsMessagesLoading: (status) => set({ isMessagesLoading: status }),
  isSendingMessage: false,
  setIsSendingMessage: (status) => set({ isSendingMessage: status }),
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
          cachedConversation: newCache,
          activeConversationId: conversation._id
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
        isMessagesLoading: false,
      });
      return;
    } 
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
      const { messages: newMessages, hasMore } : FetchMoreMessagesProps = res.data
      set((state) => {
        // Create a Set of existing message IDs for fast lookup
        const existingIds = new Set(state.messages.map(msg => msg._id))

        // Filter out any duplicates from new messages
        const filteredNewMessages = newMessages.filter(
          msg => !existingIds.has(msg._id)
        );

        return {
          messages: [...filteredNewMessages, ...state.messages],
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
    const { conversationId, text } = messageData;
    const userId = useAuthStore.getState().authUser?._id;
    if (!selectedUser?._id || !conversationId || !userId) return;
    // Optimistically update the sidebar for the sender
    set((state) => {
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
      const existingUsersCache = state.cachedUsers.get(userId)
      const newUsersCached = new Map(state.cachedUsers)
      const updatedUsersCache = existingUsersCache?.users.map((user) => {
        if (selectedUser._id === user._id) {
          return {
            ...user,
            timestamp: new Date()
          }
        }
        return user
      })

      newUsersCached.set(userId, {
        users: updatedUsersCache || [],
        timestamp: Date.now()
      })

      const temporaryMessage = createTemporaryMessage(messageData, userId, selectedUser._id)

      return { 
        users: sortedUsers, 
        currentPage: state.currentPage, 
        text: "",
        cachedUsers: newUsersCached,
        messages: [...state.messages, temporaryMessage]
      }  
    });

    set({ isSendingMessage: true })
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const { newMessage } : SendMessageProps = res.data
      set((state) => {
        const filteredMessages = state.messages.filter((message) => !message.isTemporary)
        const updatedMessages = [...filteredMessages, newMessage]
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
    } finally {
      set({ isSendingMessage: false })
    }
  },
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      return;
    }
    socket.on("messageDelivered", (data) => {
      set((prevState) => {
        const updatedMessages = prevState.messages.map((msg) => {
          if (msg.conversationId === data.conversationId && msg.status === 'sent') {
            return { ...msg, status: data.status }
          }
          return msg
        });

        const cached = new Map(prevState.cachedMessages);
        if (cached.has(data.conversationId)) {
          const cacheEntry = cached.get(data.conversationId);
          const updatedCachedMessages: MessagesProps[] = (cacheEntry?.messages || []).map((msg) =>
            msg.conversationId === data.conversationId && msg.status === "sent"
              ? { ...msg, status: data.status }
              : msg
          );
          cached.set(data.conversationId, {
            ...cacheEntry,
            messages: updatedCachedMessages,
            timestamp: Date.now(),
            selectedUser: cacheEntry?.selectedUser || null,
            hasMoreMessages: cacheEntry?.hasMoreMessages || null,
            currentPage: cacheEntry?.currentPage || 1
          });
        }

        return {  messages: updatedMessages, cachedMessages: cached }
      })
    })

    socket.on("messagesSeen", (data) => {
      set((prevState) => {
        const updatedMessages = prevState.messages.map((msg) => {
          if (msg.conversationId === data.conversationId && msg.status === "delivered") {
            return { ...msg, status: data.status };
          }
          return msg;
        });
        const cached = new Map(prevState.cachedMessages);
        if (cached.has(data.conversationId)) {
          const cacheEntry = cached.get(data.conversationId);
          const updatedCachedMessages: MessagesProps[] = (cacheEntry?.messages || []).map((msg) =>
            msg.conversationId === data.conversationId && msg.status === "delivered"
              ? { ...msg, status: data.status }
              : msg
          );
          
          cached.set(data.conversationId, {
            ...cacheEntry,
            messages: updatedCachedMessages,
            timestamp: Date.now(),
            selectedUser: cacheEntry?.selectedUser || null,
            hasMoreMessages: cacheEntry?.hasMoreMessages || null,
            currentPage: cacheEntry?.currentPage || 1
          });
        }

        return {  messages: updatedMessages, cachedMessages: cached }
      });
    });

    // Listen for typing events
    socket.on("userTyping", ({ senderId }) => {
      // console.log(`🟣 Frontend received 'userTyping' from ${senderId}`);
      useAuthStore.setState((state) => ({
        typingUsers: [...new Set([...state.typingUsers, senderId])],
      }));
    });

    socket.on("userStoppedTyping", ({ senderId }) => {
      useAuthStore.setState((state) => ({
        typingUsers: state.typingUsers.filter((id) => id !== senderId),
      }));
    });
  },
  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket
    socket?.off("messageDelivered")
    socket?.off("messagesSeen")
    socket?.off("userTyping")
    socket?.off("userStoppedTyping")
  },
  subscribeToLastMessage: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.log("[Socket] No socket connection found");
      return;
    }
    console.log("[Socket] Subscribing to last message...");
    
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