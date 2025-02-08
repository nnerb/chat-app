export interface FormDataProps {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginDataProps {
  email: string;
  password: string;
}

export interface UpdateProfileProps {
  profilePic: string
}

export interface MessageDataProps {
  text: string;
  image: string;
  conversationId: string;
}

export interface AIGeneratedResponseProps {
  selectedMessageId: string | null, 
  conversationId: string
}