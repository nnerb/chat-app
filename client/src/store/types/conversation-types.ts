import { AuthUser } from "../useAuthStore";
import { MessagesProps } from "./message-types";

export interface ConversationProps {
  _id: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  _id: string;
  conversation: ConversationProps,
  aiGenerateRepliesCount: number | null,
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  conversation: ConversationProps,
  selectedUser: AuthUser | null
  messages: MessagesProps[],
  currentPage: number,
  hasMore: boolean,
}

export interface NewConversationProps {
  conversation: ConversationProps;
  senderId: string;
}