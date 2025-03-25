// src/features/auth/hooks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from './api';
import toast from 'react-hot-toast';
import { APIError } from '../../lib/api/errorHandler';
import { useAuthStore } from '../../store/useAuthStore';

export const useLogin = () => {
  const { connectSocket, setAuthUser } = useAuthStore.getState()
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (user) => {
      connectSocket();
      setAuthUser(user)
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
      connectSocket();
      setAuthUser(user)
      queryClient.setQueryData(['auth'], user);
      toast.success('Account created successfully');
    },
    onError: (error: APIError) => {
      toast.error(error.message);
    },
  });
};

export const useLogout = () => {
  const { disconnectSocket, setAuthUser } = useAuthStore.getState()
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      disconnectSocket();
      setAuthUser(null)
      queryClient.removeQueries({ queryKey: ['auth'] })
    },
    onError: (error: APIError) => {
      toast.error(error.message);
    },
  });
};
