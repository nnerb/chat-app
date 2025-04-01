import axios, { AxiosResponse } from 'axios';

export type APIError = {
  message: string;
  status: number | null;
  response?: AxiosResponse;
};

export const handleAPIError = (error: unknown): APIError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data.message || 'An unexpected error occurred',
      status: error.response?.status || null,
      response: error.response,
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    status: null,
  };
};