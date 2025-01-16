import axios from "axios";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AuthUser } from "./useAuthStore";

interface UseMessageStoreProps {
  messages: string[];
  users: AuthUser[];
  selectedUser: AuthUser | null,
  isUsersLoading: boolean,
  isMessagesLoading: boolean,
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  setSelectedUser: (selectedUser: AuthUser) => void;
}

export const useMessageStore = create<UseMessageStoreProps>((set) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
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
  getMessages: async (userId: string ) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
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
  setSelectedUser: (selectedUser) => set({ selectedUser }),
})) 