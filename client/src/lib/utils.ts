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

export const formatRelativeTime = (timestamp: string) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);  
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);



  if (secondsAgo < 60) return "1m ago"; 
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 30) return `${daysAgo}d ago`;
  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) return `${monthsAgo}m ago`;
  const yearsAgo = Math.floor(monthsAgo / 12);
  return `${yearsAgo}y ago`;
};