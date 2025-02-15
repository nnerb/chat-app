
import { useEffect } from "react";
import { useMessageStore } from "../../../store/useMessageStore";
import ChatHeader from "./chat-header";
import MessageSkeleton from "../../../components/skeletons/message-skeleton";
import MessageInput from "./message-input";
import { useParams } from "react-router-dom";
import MessageContent from "./message-content";


const ChatContainer = () => {
  const {
    getMessages,
    isMessagesLoading,
    resetMessages,
  } = useMessageStore()

  const { conversationId } = useParams()

  useEffect(() => {
    if (!conversationId) return
    const fetchMessages = async() => {
      await getMessages(conversationId)
    }
    fetchMessages()
    return () => {
      resetMessages()
    }
  },[conversationId, resetMessages, getMessages])

  if (isMessagesLoading) {
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