import axios, { AxiosError } from "axios";
import { handleAPIError } from "./errorHandler";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = handleAPIError(error);
    apiError.response = error.response
    return Promise.reject(apiError);
  }
);
