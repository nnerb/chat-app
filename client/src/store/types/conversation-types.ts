import { AuthUser } from "../useAuthStore";
import { MessagesProps } from "./message-types";

export interface ConversationProps {
  _id: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
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