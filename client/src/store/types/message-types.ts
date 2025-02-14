import { AuthUser } from "../useAuthStore";

export interface MessagesProps {
 _id: string;
 conversationId: string;
 senderId: AuthUser;
 createdAt: string;
 image: string;
 text: string; 
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
  timestamp: Date;
}

