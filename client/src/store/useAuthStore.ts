import { create } from "zustand";
import { axiosInstance } from "../lib/api/client";
import { UpdateProfileProps } from "../types";
import toast from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";
import { useMessageStore } from "./useMessageStore";
import { MessagesProps } from "./types/message-types";
import { APIError } from "../lib/api/errorHandler";

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
  setAuthUser: (user: AuthUser | null) => void;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  isLoggingOut: boolean;
  setIsLoggingOut: (status: boolean) => void;
  onlineUsers: string[]
  socket: ReturnType<typeof io> | null
  typingUsers: string[]
  checkAuth: () => Promise<void>;
  updateProfile: (data: UpdateProfileProps ) => Promise<void>;
  removeProfile: () => Promise<void>
  connectSocket: () => void;
  setupSocketListeners: (socket: ReturnType<typeof io> | null) => void;
  disconnectSocket: () => void;
  startTyping: (conversationId: string) => void;  // <-- Add this
  stopTyping: (conversationId: string) => void;   // <-- Add this
}

export const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/"

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  setAuthUser: (user) => set({ authUser: user }),
  isUpdatingProfile: false,
  isCheckingAuth: false,
  isLoggingOut: false,
  setIsLoggingOut: (status) => set({ isLoggingOut: status }),
  onlineUsers: [],
  socket: null,
  typingUsers: [],
  checkAuth: async () => {
    set({ isCheckingAuth: true })
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data })
      get().connectSocket()
    } catch (error: unknown) {
      if (error as APIError ) {
        console.warn("User is not logged in.");
      } else {
        console.error("Unexpected error during auth check:", error);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false })
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
    const { authUser, socket, setupSocketListeners } = get()
    if (!authUser || socket?.connected) return
    const newSocket = io(BASE_URL, {
      query: {
        userId: authUser._id
      }
    })
    newSocket.connect()
    set({ socket: newSocket })

    useAuthStore.setState((state) => ({
      authUser: state.authUser ? { ...state.authUser, lastSeen: "" } : null,
    }))
    setupSocketListeners(newSocket)
  },
  setupSocketListeners: (socket) => {
    if (!socket) {
      console.warn("Socket is not defined, cannot set up listeners!");
      return
    }
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds })
    })

    socket.on("newMessage", (newMessage: MessagesProps) => {
      const { authUser } = get();
      const conversation = useMessageStore.getState().conversation;

      const userId = authUser?._id
      // Check if the message is intended for the current user
      if (newMessage.receiverId !== userId) return;
  
      // Determine if the message belongs to the currently viewed conversation
      const isCurrentConversation = newMessage.conversationId === conversation?._id;
  
      useMessageStore.setState((state) => {
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

    socket.on("lastMessage", (newMessage: MessagesProps) => {
      useMessageStore.setState((state) => {
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
  disconnectSocket: () => {
    const { socket } = get()
    useMessageStore.setState({
      cachedAIResponses: new Map(),
      cachedConversation: new Map(),
      cachedMessages: new Map(),
      cachedUsers: new Map(),
    })
    useAuthStore.setState((state) => ({
      authUser: state.authUser ? { ...state.authUser, lastSeen: new Date().toString() } : null,
    }))
    if (socket?.connected) socket?.disconnect();
  },
  startTyping: (conversationId) => {
    const { socket, authUser } = get();
    if (socket && authUser) {
      // console.log("Emitting 'typing' event for:", conversationId);
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