export interface MessagesProps {
 _id: string;
 conversationId: string;
 senderId: string;
 receiverId: string;
 text: string; 
 image: string;
 createdAt: string;
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
  messages: MessagesProps[],
  newMessage: MessagesProps 
}