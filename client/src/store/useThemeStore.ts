import { create } from "zustand";

interface UseThemeStoreProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<UseThemeStoreProps>((set) => ({
  theme: localStorage.getItem('chat-theme') || 'coffee',
  setTheme: (theme: string) => {
    localStorage.setItem('chat-theme', theme)
    set({ theme })
  }
}))

