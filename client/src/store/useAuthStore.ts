import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { FormDataProps, LoginDataProps, UpdateProfileProps } from "../types";
import toast from "react-hot-toast";
import axios from "axios";

export interface AuthUser {
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
  signup: (data: FormDataProps) => Promise<void>;
  logout: () => Promise<void>
  login: (data: LoginDataProps) => Promise<void>;
  updateProfile: (data: UpdateProfileProps ) => Promise<void>
  removeProfile: () => Promise<void>
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
      await axiosInstance.post("/auth/logout")
      set({ authUser: null })
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
      toast.success("Logged in successfully");
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
}))