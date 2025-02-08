import { AuthUser } from "../useAuthStore";

export interface ConversationProps {
  _id: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  conversation: ConversationProps,
  selectedUser: AuthUser
}