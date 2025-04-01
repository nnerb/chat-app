import { MessagesProps } from "../store/types/message-types";
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
  if (daysAgo < 7) return `${daysAgo}d ago`;
  const weeksAgo = Math.round(daysAgo / 7);
  if (daysAgo >= 7 && daysAgo < 30) return `${weeksAgo}w ago`;
  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) return `${monthsAgo}m ago`;
  const yearsAgo = Math.floor(monthsAgo / 12);
  return `${yearsAgo}y ago`;
};

const MAX_CACHE_SIZE = 50; // Maximum cache size
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// Generic cache manager
const createCacheWithLimit = <T>(cache: Map<string, T>): Map<string, T> => {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstEntry = cache.keys().next();
    if (!firstEntry.done && firstEntry.value) {
      cache.delete(firstEntry.value);
    }
  }
  return cache;
};

// Generic cache updater
export const updateCache = <T>(
  cache: Map<string, T>,
  key: string,
  value: T
): Map<string, T> => {
  const newCache = new Map(cache);
  newCache.set(key, value);
  return createCacheWithLimit(newCache);
};

// Generic cache getter with TTL check
export const getFromCache = <T>(
  cache: Map<string, T & { timestamp: number }>,
  key: string
): T | undefined => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry;
  }
  return undefined;
};

export const createTemporaryMessage = (
  messageData: Partial<MessagesProps>,
  userId: string,
  selectedUserId: string
): MessagesProps => {
  return {
    _id: "", // Temporary id
    conversationId: messageData.conversationId!,
    senderId: userId,
    receiverId: selectedUserId,
    text: messageData.text || "",
    image: messageData.image || "",
    createdAt: new Date().toISOString(),
    status: "sending",
    isTemporary: true
  }
}