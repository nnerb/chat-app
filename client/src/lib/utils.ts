import { AuthUser } from "../store/useAuthStore";

export function formatMessageTime(date: string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

 export const areUsersDifferent = (users1: AuthUser[], users2: AuthUser[]) => {
    return JSON.stringify(users1) !== JSON.stringify(users2);
};