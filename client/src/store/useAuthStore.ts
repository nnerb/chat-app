import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

interface AuthUser {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  profilePic: string;
  createdAt: string;
}

interface AuthState {
  authUser: AuthUser | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
}


export const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data })
    } catch (error) {
      console.log("Error in check auth", error)
      set({ authUser: null })
    } finally {
      set({ isCheckingAuth: false })
    }
  }
}))