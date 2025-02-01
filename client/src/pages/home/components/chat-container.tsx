
import { useCallback, useEffect, useRef } from "react";

import { useMessageStore } from "../../../store/useMessageStore";
import ChatHeader from "./chat-header";
import MessageSkeleton from "../../../components/skeletons/message-skeleton";
import MessageInput from "./message-input";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import IndividualChat from "./individual-chat";
import { useAuthStore } from "../../../store/useAuthStore";

const ChatContainer = () => {
  const {
    messages,
    isConversationLoading,
    selectedUser,
    getConversation,
    validConversationId,
    isMessagesLoading,
    hasMoreMessages,
    currentPage,
    isFetchingMoreMessages,
    fetchMoreMessages,
    subscribeToMessages,
    unsubscribeToMessages
  } = useMessageStore()

  const messageEndRef = useRef<HTMLDivElement>(null)
  const { conversationId } = useParams()
  const { authUser } = useAuthStore();
  const observer = useRef<IntersectionObserver | null>(null)

  const topMessageRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingMoreMessages) return 
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreMessages) {
        if(conversationId) {
          const fetchMoreMessagesHandler = async() => {
            await fetchMoreMessages(conversationId, currentPage)
          }
          fetchMoreMessagesHandler()
        }
      }
    })
    if (node) observer.current.observe(node)
  
  },[isFetchingMoreMessages, currentPage, hasMoreMessages, conversationId, fetchMoreMessages])

  useEffect(() => {
    const fetchConversation = async() => {
      if (conversationId && !validConversationId) {
        await getConversation(conversationId)
      } 
    }
    fetchConversation()
  },[conversationId, getConversation, validConversationId])

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView(); 
    }
    subscribeToMessages()
    return () => unsubscribeToMessages()
  }, [messages, conversationId, subscribeToMessages, unsubscribeToMessages]);

  if (isConversationLoading || isMessagesLoading) {
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 overflow-x-hidden relative">
        { isFetchingMoreMessages && 
          <div className="text-center grid place-items-center">
            <Loader2 className="animate-spin"/>
          </div>
        }
        {messages.map((message, index) => {
          if (index === 0) {
            return (
              <div
                key={message._id}
                className={`chat ${message.senderId._id === authUser?._id ? "chat-end" : "chat-start"}`}
                ref={topMessageRef}
              >
                <IndividualChat 
                message={message}
                selectedUser={selectedUser}
                />
              </div>
            )
          }  else {
            return (
              <div
                key={message._id}
                className={`chat ${message.senderId._id === authUser?._id ? "chat-end" : "chat-start"}`}
                ref={messageEndRef}
              >
                <IndividualChat
                  message={message}
                  selectedUser={selectedUser}
                />
              </div>
            )
          }
        })}
      </div>
      <MessageInput />
    </div>
  );
};
export default ChatContainer;