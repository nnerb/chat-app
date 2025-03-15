import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { FormDataProps, LoginDataProps, UpdateProfileProps } from "../types";
import toast from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";

export interface AuthUser {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  profilePic: string;
  createdAt: string;
  lastSeen: string;
}

interface AuthState {
  authUser: AuthUser | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[]
  socket: ReturnType<typeof io> | null
  typingUsers: string[]
  checkAuth: () => Promise<void>;
  signup: (data: FormDataProps) => Promise<void>;
  logout: () => Promise<void>;
  login: (data: LoginDataProps) => Promise<void>;
  updateProfile: (data: UpdateProfileProps ) => Promise<void>;
  removeProfile: () => Promise<void>
  connectSocket: () => void;
  disconnectSocket: () => void;
  startTyping: (conversationId: string) => void;  // <-- Add this
  stopTyping: (conversationId: string) => void;   // <-- Add this
}

export const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/"

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  typingUsers: [],
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data })
      get().connectSocket()
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn("User is not logged in.");
      } else {
        console.error("Unexpected error during auth check:", error);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false })
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Narrowing the type of error to AxiosError
        const errorMessage = error.response?.data?.message || 'An error occurred during signup';
        toast.error(errorMessage);
      } else {
        // Handle non-Axios errors
        toast.error('An unexpected error occurred');
      }
    } finally {
      set({ isSigningUp: false });
    }
  },
  logout: async () => {
    try {
      const { authUser } = get()
      await axiosInstance.post(`/auth/logout/${authUser?._id}`)
      set({ authUser: null })
      get().disconnectSocket()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Narrowing the type of error to AxiosError
        const errorMessage = error.response?.data?.message || 'An error occurred during signup';
        toast.error(errorMessage);
      } else {
        // Handle non-Axios errors
        toast.error('An unexpected error occurred');
      }
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      get().connectSocket()
      toast.success("Logged in successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Narrowing the type of error to AxiosError
        const errorMessage = error.response?.data?.message || 'An error occurred during login';
        toast.error(errorMessage);
      } else {
        // Handle non-Axios errors
        toast.error('An unexpected error occurred');
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Narrowing the type of error to AxiosError
        const errorMessage = error.response?.data?.message || 'An error occurred during updating profile';
        toast.error(errorMessage);
      } else {
        // Handle non-Axios errors
        toast.error('An unexpected error occurred');
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  removeProfile: async () => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/remove-profile");
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Narrowing the type of error to AxiosError
        const errorMessage = error.response?.data?.message || 'An error occurred during updating profile';
        toast.error(errorMessage);
      } else {
        // Handle non-Axios errors
        toast.error('An unexpected error occurred');
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser, socket } = get()
    if (!authUser || socket?.connected) return
    const newSocket = io(BASE_URL, {
      query: {
        userId: authUser._id
      }
    })
    newSocket.connect()
    set({ socket: newSocket })
    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds })
    })

     // Listen for typing events
    newSocket.on("userTyping", ({ senderId }) => {
      console.log(`🟣 Frontend received 'userTyping' from ${senderId}`);
      set((state) => ({
        typingUsers: [...new Set([...state.typingUsers, senderId])],
      }));
    });

    newSocket.on("userStoppedTyping", ({ senderId }) => {
      set((state) => ({
        typingUsers: state.typingUsers.filter((id) => id !== senderId),
      }));
    });
  },
  disconnectSocket: () => {
   const { socket } = get()
    if (socket?.connected) socket?.disconnect();
  },
  startTyping: (conversationId) => {
    const { socket, authUser } = get();
    if (socket && authUser) {
      console.log("Emitting 'typing' event for:", conversationId);
      socket.emit("typing", { senderId: authUser._id, conversationId });
    }
  },

  stopTyping: (conversationId) => {
    const { socket, authUser } = get();
    if (socket && authUser) {
      socket.emit("stopTyping", { senderId: authUser._id, conversationId });
    }
  },
}))