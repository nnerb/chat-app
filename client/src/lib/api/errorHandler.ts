import axios from 'axios';

export type APIError = {
  message: string;
  status: number | null;
};

export const handleAPIError = (error: unknown): APIError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || 'An unexpected error occurred',
      status: error.response?.status || null,
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    status: null,
  };
};