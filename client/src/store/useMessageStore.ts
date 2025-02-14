import axios from "axios";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AuthUser, useAuthStore } from "./useAuthStore";
import { AIGeneratedResponseProps, MessageDataProps } from "../types";
import {  IUserSidebar, MessagesProps } from "./types/message-types";
import { ConversationProps, ConversationResponse } from "./types/conversation-types";

interface UseMessageStoreProps {
  text: string;
  setText: (text: string) => void
  messages: MessagesProps[];
  setMessages: (messages: MessagesProps[]) => void
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
  selectedMessageId: string | null;
  cachedAIResponses: Map<string, string[]>;
  cachedMessages: Map<string, MessagesProps[]>;
  cachedHasMoreMessages: Map<string, boolean>;
  cachedConversation: Map<string, ConversationProps | null>;
  cachedUsers: Map<string, IUserSidebar[] | []>
  resetMessages: () => void;
  getUsers: () => Promise<void>;
  getConversation: (selectedUser: IUserSidebar | null, navigate: (path: string) => void) => Promise<void>;
  fetchMoreMessages: (conversationId: string, currentPage: number) => Promise<void>
  getMessages: (conversationId: string) => Promise<void>;
  sendMessage: (messageData: MessageDataProps) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeToMessages: () => void;
  generateAIResponse: (data: AIGeneratedResponseProps, regenerate?: boolean) => Promise<void>
}

export const useMessageStore = create<UseMessageStoreProps>((set, get) => ({
  text: "",
  setText: (text) => set({ text }),
  messages: [],
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
  isFetchingMoreMessages: false,
  isGeneratingAIResponse: false,
  selectedMessageId: null,
  cachedAIResponses: new Map(),
  cachedMessages: new Map(),
  cachedHasMoreMessages: new Map(),
  cachedConversation: new Map(),
  cachedUsers: new Map(),
  getUsers: async () => {
    const userId = useAuthStore.getState().authUser?._id
    if (!userId) return

    const { cachedUsers } = get()
    const cachedUsersResponse = cachedUsers.get(userId)

    if (cachedUsersResponse) {
      set({ users: cachedUsersResponse })
      return
    }

    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set((state) => ({ 
        users: res.data,
        cachedUsers: new Map(state.cachedUsers).set(userId, res.data)
      }));
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
    const cachedConversationResponse = cachedConversation.get(selectedUser._id)

    if (cachedConversationResponse) {
      set({ conversation: cachedConversationResponse })
      navigate(`/messages/${cachedConversationResponse._id}`);
      return
    }

    set({ isConversationLoading: true });
    try {
      // Fetch or create conversation with the selected user
      const res = await axiosInstance.get(`/conversation/${selectedUser._id}`);
      const { conversation }  = res.data as ConversationResponse

      if (conversation) {
        set((state) => ({ 
          conversation,
          validConversationId: true,
          cachedConversation: new Map(state.cachedConversation).set(selectedUser._id, conversation)
        }))
        navigate(`/messages/${conversation._id}`);
      } else {
        throw new Error("Failed to retrieve conversation.");
      }
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
    // const { cachedMessages, cachedHasMoreMessages, selectedUser } = get();

    // const cachedMessagesResponse =  cachedMessages.get(conversationId)
    // const cachedHasMoreMessagesResponse = cachedHasMoreMessages.get(conversationId)
    
    // if (cachedMessagesResponse) {
    //   set({
    //     messages: cachedMessagesResponse,
    //     hasMoreMessages: cachedHasMoreMessagesResponse,
    //     currentPage: 1,
    //     selectedUser
    //   })
    //   return;
    // }
    set({ isMessagesLoading : true });
    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`);
      const { hasMore, currentPage, messages, selectedUser, conversation } = res.data
      set(() => ({ 
        messages, 
        selectedUser, 
        conversation,
        validConversationId: true,
        hasMoreMessages: hasMore,
        currentPage,
        // cachedMessages: new Map(state.cachedMessages).set(conversationId, messages),
        // cachedHasMoreMessages: new Map(state.cachedHasMoreMessages).set(conversationId, hasMore)
      }));
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
      const { messages, hasMore } = res.data;
      if (messages.length) {
        set((state) => ({
          messages: [...messages, ...state.messages],
          currentPage: currentPage + 1,
          hasMoreMessages: hasMore
        }));
      }
    } catch (error) {
      console.error("Failed to fetch more messages:", error);
      toast.error("Failed to load older messages.");
    } finally {
      set({ isFetchingMoreMessages: false });
    }
  }, 
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const conversationId = messageData.conversationId;
    if (!selectedUser?._id || !conversationId) return;
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser?._id}`, messageData);
      set(() => {
        return {
          messages: res.data.messages,
          // cachedMessages: new Map(state.cachedMessages).set(conversationId, res.data.messages),
        };
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
    const { selectedUser, messages } = get()
    const socket = useAuthStore.getState().socket
  
    if (!socket) {
      console.log("[Socket] No socket connection found");
      return;
    }
    console.log("[Socket] Subscribing to messages...");

    if (!selectedUser) return
    socket?.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId !== selectedUser._id
      if (isMessageSentFromSelectedUser) return
      set({ messages: [...messages, newMessage] })
    })
  },
  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket
    socket?.off("newMessage")
  },
  generateAIResponse: async (data, regenerate) => {
    const modal = document.getElementById("my_modal_2");     
    set({ isGeneratingAIResponse: true })
    try {
      const { cachedAIResponses } = get()
      const cacheKey = `${data.conversationId}-${data.selectedMessageId}`;
      const cachedResponses = cachedAIResponses.get(cacheKey)

      if (cachedResponses && !regenerate) {
        set({ aiGeneratedResponse: cachedResponses, selectedMessageId: data.selectedMessageId });
        return;
      }

      const res = await axiosInstance.post(`/messages/generate-reply`, data);
      set((state) => ({
        aiGeneratedResponse: res.data.replyOptions,
        selectedMessageId: data.selectedMessageId,
        cachedAIResponses: new Map(state.cachedAIResponses).set(cacheKey, res.data.replyOptions),
      }));
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