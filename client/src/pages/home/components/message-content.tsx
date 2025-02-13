import { Loader2 } from "lucide-react";
import { useMessageStore } from "../../../store/useMessageStore";
import IndividualChat from "./individual-chat";
import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useParams } from "react-router-dom";

const MessageContent = () => {
  const { 
    messages, 
    isFetchingMoreMessages, 
    hasMoreMessages,
    isMessagesLoading,
    fetchMoreMessages,
    currentPage,
    selectedUser,
  } = useMessageStore()
  const { authUser } = useAuthStore();
  const messageEndRef = useRef<HTMLDivElement>(null)
  const observer = useRef<IntersectionObserver | null>(null)
  const { conversationId } = useParams()

  const topMessageRef = useCallback((node: HTMLDivElement) => {
      if (isFetchingMoreMessages) return 
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMoreMessages) {
          if(conversationId && !isMessagesLoading) {
            const fetchMoreMessagesHandler = async() => {
              await fetchMoreMessages(conversationId, currentPage)
            }
            fetchMoreMessagesHandler()
          }
        }
      })
      if (node) observer.current.observe(node)
  
    },[isFetchingMoreMessages, currentPage, hasMoreMessages, conversationId, fetchMoreMessages, isMessagesLoading])

    useEffect(() => {
      if (messageEndRef.current && messages) {
        messageEndRef.current.scrollIntoView(); 
      }
    }, [messages]);
  

  return ( 
    <div className="flex-1 overflow-y-auto p-4 space-y-4 overflow-x-hidden relative">
      {isFetchingMoreMessages && (
        <div className="text-center grid place-items-center">
          <Loader2 className="animate-spin" />
        </div>
      )}
      {messages.map((message, index) => (
        <div
          key={message._id}
          className={`chat ${message.senderId._id === authUser?._id ? "chat-end" : "chat-start"}`}
          ref={index === 0 ? topMessageRef : messageEndRef} // Use refs only when needed
        >
          <IndividualChat message={message} selectedUser={selectedUser} />
        </div>
      ))}
    </div>
   );
}
 
export default MessageContent;