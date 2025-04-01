import { create } from "zustand";
import { IUserSidebar } from "./types/message-types";

export interface UseUserStoreProps {
  users: IUserSidebar[]
}

export const useUserStore = create<UseUserStoreProps>(() => ({
  users: [],
}))