// src/features/auth/hooks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from './api';
import toast from 'react-hot-toast';
import { APIError } from '../../lib/api/errorHandler';
import { AuthUser, useAuthStore } from '../../store/useAuthStore';

export const useCheckAuth = () => {
  const { connectSocket, setAuthUser, setIsCheckingAuth } = useAuthStore.getState()
  return useMutation<AuthUser, APIError>({
    onMutate: () => setIsCheckingAuth(true),
    mutationFn: authAPI.checkAuth,
    onSuccess: (user) => {
      setAuthUser(user)
      connectSocket();
    },
    onError: (error) => {
      if (error.status === 401) {
        return
      } 
      console.error(error.message);
    },
    onSettled: () => setIsCheckingAuth(false)
  });
};

export const useLogin = () => {
  const { connectSocket, setAuthUser } = useAuthStore.getState()
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (user) => {
      setAuthUser(user)
      connectSocket();
      queryClient.setQueryData(['auth'], user);
      toast.success('Logged in successfully');
    },
    onError: (error: APIError) => {
      toast.error(error.message);
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  const { connectSocket, setAuthUser } = useAuthStore.getState()
  return useMutation({
    mutationFn: authAPI.signup,
    onSuccess: (user) => {
      setAuthUser(user)
      connectSocket();
      queryClient.setQueryData(['auth'], user);
      toast.success('Account created successfully');
    },
    onError: (error: APIError) => {
      toast.error(error.message);
    },
  });
};

export const useLogout = () => {
  const { disconnectSocket, setAuthUser, setIsLoggingOut } = useAuthStore.getState()
  const queryClient = useQueryClient();
  return useMutation({
    onMutate: () => setIsLoggingOut(true),
    mutationFn: authAPI.logout,
    onSuccess: () => {
      setAuthUser(null)
      queryClient.removeQueries({ queryKey: ['auth'] })
      disconnectSocket();
    },
    onError: (error: APIError) => {
      toast.error(error.message);
    },
    onSettled: () => setIsLoggingOut(false)
  });
};
