import { create } from "zustand";
import { axiosInstance } from "../lib/api/client";
import { UpdateProfileProps } from "../types";
import toast from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";
import { useMessageStore } from "./useMessageStore";
import { MessageUpdateProps } from "./types/message-types";
import { ConversationResponse, MessageResponse, NewConversationProps } from "./types/conversation-types";
import { useUserStore } from "./useUserStore";
import { QueryClient } from "@tanstack/react-query";
import { GetUsersResponse } from "../features/users/api";
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
  queryClient: QueryClient | null;
  setQueryClient: (client: QueryClient) => void;
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  setIsCheckingAuth: (status: boolean) => void;
  isLoggingOut: boolean;
  setIsLoggingOut: (status: boolean) => void;
  onlineUsers: string[]
  socket: ReturnType<typeof io> | null
  typingUsers: string[]
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
  queryClient: null,
  setQueryClient: (client) => set({ queryClient: client }),
  authUser: null,
  setAuthUser: (user) => set({ authUser: user }),
  isUpdatingProfile: false,
  isCheckingAuth: true,
  setIsCheckingAuth: (status ) => set({ isCheckingAuth: status}),
  isLoggingOut: false,
  setIsLoggingOut: (status) => set({ isLoggingOut: status }),
  onlineUsers: [],
  socket: null,
  typingUsers: [],
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
    socket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds })
    })

    socket.on("newConversation", ({ conversation, senderId } : NewConversationProps) => {
      useMessageStore.setState((state) => {
       const updatedUsers =  state.users.map((user) => {
          if (user._id === senderId) {
            return {
              ...user,
              conversationId: conversation._id
            }
          }
          return user
        })
        return { users: updatedUsers }
      })
    });




    socket.on("messageUpdate", ({ newMessage, lastMessage } : MessageUpdateProps ) => {

      const { conversation, messages } = useMessageStore.getState();
      const { authUser, queryClient } = useAuthStore.getState();
      if (!authUser || !queryClient) return

      const userId = authUser._id
      const messageExists = messages.some(msg => msg._id === newMessage._id);

      if (newMessage.senderId === userId || newMessage.receiverId !== userId || messageExists) return;

      const conversationId = newMessage.conversationId;
      const isCurrentConversation = newMessage.conversationId === conversation?._id;

      useUserStore.setState((state) => {       
        const updatedUsers = state.users.map((user) => {
          if (user.conversationId === conversationId) {
            return { ...user, lastMessage };
          }
          return user;
        }).sort((a, b) => {
          const timeA = new Date(a.lastMessage?.timestamp || 0).getTime();
          const timeB = new Date(b.lastMessage?.timestamp || 0).getTime();
          return timeB - timeA; // Descending order (latest first)
        });

        const existingUsersCache = queryClient.getQueryData<GetUsersResponse>(['users']);

        if (existingUsersCache) {
          queryClient.setQueryData<GetUsersResponse>(['users'], (old) => {
            if (!old) return old;
            return {
              ...old,
              usersWithLastMessage: old.usersWithLastMessage.map(user => 
                user.conversationId === conversationId
                  ? { ...user, lastMessage }
                  : user
              ).sort((a, b) =>
                new Date(b.lastMessage?.timestamp || 0).getTime() -
                new Date(a.lastMessage?.timestamp || 0).getTime()
              )
            };
          });
        }
        return { users: updatedUsers }
      });
      useMessageStore.setState((state) => {
        const existingMessagesCache = queryClient.getQueryData<MessageResponse>(['messages', conversationId])
        let updatedConversationMessages
        if (existingMessagesCache) {
          queryClient.setQueryData<ConversationResponse>(['messages', conversationId], (old) => {
            if (!old) return old 
            return {
              ...old,
              messages: [...existingMessagesCache.messages, newMessage],
            }
          })
          updatedConversationMessages  = [...state.messages, newMessage]
        }
        return { messages: isCurrentConversation ? updatedConversationMessages : state.messages }
      })
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