import axios from "axios";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AuthUser } from "./useAuthStore";
import { MessageDataProps } from "../types";


interface MessagesProps {
 _id: string;
 senderId: AuthUser;
 createdAt: string;
 image: string;
 text: string; 
}

interface ConversationProps {
  _id: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

interface UseMessageStoreProps {
  messages: MessagesProps[];
  users: AuthUser[];
  selectedUser: AuthUser | null,
  isUsersLoading: boolean,
  isConversationLoading: boolean,
  isMessagesLoading: boolean,
  conversation: ConversationProps | null;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  getConversation: (conversationId: string) => Promise<void>
  setSelectedUser: (selectedUser: AuthUser | null, navigate: (path: string) => void) => Promise<void>;
  sendMessage: (messageData: MessageDataProps) => Promise<void>;
}

export const useMessageStore = create<UseMessageStoreProps>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isConversationLoading: false,
  isUsersLoading: false,
  isMessagesLoading: false,
  conversation: null,
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
  getMessages: async (conversationId: string ) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/conversation/${conversationId}`);
      set({ 
        messages: res.data.messages, 
        selectedUser: res.data.selectedUser, 
        conversation: res.data.conversation 
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Narrowing the type of error to AxiosError
        const errorMessage = error.response?.data?.message || 'An error occurred while fetching messages';
        toast.error(errorMessage);
      } else {
        // Handle non-Axios errors
        toast.error('An unexpected error occurred');
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  setSelectedUser: async(selectedUser, navigate) => {
    set({ isMessagesLoading: true });
    try {
      // Fetch or create conversation with the selected user
      const res = await axiosInstance.get(`/messages/${selectedUser?._id}`);
      const conversationId = res.data.conversationId;
  
      if (conversationId) {
        set({ messages: res.data.messages })
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
  getConversation: async (conversationId) => {
    set({ isConversationLoading: true });
    try {
      const res = await axiosInstance.get(`/conversation/${conversationId}`);
      set({ conversation: res.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Narrowing the type of error to AxiosError
        const errorMessage = error.response?.data?.message || 'An error occurred while fetching conversation';
        toast.error(errorMessage);
      } else {
        // Handle non-Axios errors
        toast.error('An unexpected error occurred');
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
})) 