import { AuthUser } from "../useAuthStore";
import { CachedMessages } from "../useMessageStore";
import { ConversationProps } from "./conversation-types";

export interface MessagesProps {
 _id: string;
 conversationId: string;
 senderId: string;
 receiverId: string;
 text: string; 
 image: string;
 createdAt: string;
 status: 'sent' | 'delivered' | 'seen' | 'sending' | string
 isTemporary?: boolean;
}

export interface IUserSidebar {
  _id: string;
  conversationId: string;
  name: string;
  profilePicture: string;
  lastMessage: ILastMessage | null;
}

interface ILastMessage {
  content: string;
  sender: string;
  timestamp: string;
}
export interface FetchMoreMessagesProps {
  messages: MessagesProps[],
  hasMore: boolean;
}

export interface SendMessageProps { 
  newMessage: MessagesProps 
}

export interface MessageUpdateProps {
  newMessage: MessagesProps;
  lastMessage: ILastMessage;
}
export interface GetMessageResponse {
  cachedMessages: Map<string, CachedMessages>
  messages: MessagesProps[];
  selectedUser: AuthUser | null;
  conversation: ConversationProps
  validConversationId: boolean,
  hasMoreMessages: boolean,
  currentPage: number
}