import axios from "axios";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AuthUser, useAuthStore } from "./useAuthStore";
import { MessageDataProps } from "../types";
import { ConversationProps, MessagesProps } from "./types/auth-types";


interface UseMessageStoreProps {
  messages: MessagesProps[];
  setMessages: (messages: MessagesProps[]) => void
  users: AuthUser[];
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
  setCurrentPage: (currentPage: number) => void
  getUsers: () => Promise<void>;
  getMessages: (selectedUser: AuthUser | null, navigate: (path: string) => void) => Promise<void>;
  fetchMoreMessages: (conversationId: string, currentPage: number) => Promise<void>
  getConversation: (conversationId: string) => Promise<void>;
  sendMessage: (messageData: MessageDataProps) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeToMessages: () => void;
}

export const useMessageStore = create<UseMessageStoreProps>((set, get) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
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
  isFetchingMoreMessages: false,
  setCurrentPage: (currentPage) => set({ currentPage }),
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
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
  getMessages: async (selectedUser, navigate) => {
    set({ isMessagesLoading: true });
    try {
      // Fetch or create conversation with the selected user
      const res = await axiosInstance.get(`/messages/${selectedUser?._id}`);
      const conversationId = res.data.conversationId;
      const { hasMore, currentPage } = res.data
  
      if (conversationId) {
        set({ 
          messages: res.data.messages,
          conversation: res.data.conversation,
          selectedUser: res.data.selectedUser,  
          validConversationId: true,
          hasMoreMessages: hasMore,
          currentPage
        })
        navigate(`/messages/${conversationId}`);
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
      set({ isMessagesLoading: false });
    }
  },
  fetchMoreMessages: async (conversationId, currentPage) => {
    set({ isFetchingMoreMessages: true });
    try {
      const res = await axiosInstance.get(`/conversation/${conversationId}`, {
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
  getConversation: async (conversationId) => {
    set({ isConversationLoading: true });
    try {
      const res = await axiosInstance.get(`/conversation/${conversationId}`);
      const { hasMore, currentPage } = res.data
      set({ 
        messages: res.data.messages, 
        selectedUser: res.data.selectedUser, 
        conversation: res.data.conversation,
        validConversationId: true,
        hasMoreMessages: hasMore,
        currentPage
      });
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
      set({ isConversationLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser?._id}`, messageData);
      set({ messages: res.data.messages });
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
  }
})) 