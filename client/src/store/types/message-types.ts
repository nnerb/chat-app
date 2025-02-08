import { AuthUser } from "../useAuthStore";

export interface MessagesProps {
 _id: string;
 senderId: AuthUser;
 createdAt: string;
 image: string;
 text: string; 
}

