
import { useEffect } from "react";
import { useMessageStore } from "../../../store/useMessageStore";
import ChatHeader from "./chat-header";
import MessageSkeleton from "../../../components/skeletons/message-skeleton";
import MessageInput from "./message-input";
import { useParams } from "react-router-dom";
import MessageContent from "./message-content";
import { useAuthStore } from "../../../store/useAuthStore";


const ChatContainer = () => {
  const {
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeToMessages,
    messages,
    activeConversationId,
    setActiveConversationId
  } = useMessageStore()
  const { socket } = useAuthStore()

  const { conversationId } = useParams()


  useEffect(() => {
    if (!activeConversationId && conversationId) {
      setActiveConversationId(conversationId)
    }

    if (conversationId && socket && activeConversationId) {
      socket.emit("joinConversation", activeConversationId);
      subscribeToMessages();
    }
    return () => {
      if (socket && conversationId && activeConversationId) {
        socket.emit("leaveConversation", activeConversationId);
        unsubscribeToMessages();
      }
    };
  }, [setActiveConversationId, conversationId, socket, subscribeToMessages, unsubscribeToMessages, activeConversationId]);

  if (isMessagesLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <ChatHeader />
      <MessageContent />
      <MessageInput />
    </div>
  );
};
export default ChatContainer;