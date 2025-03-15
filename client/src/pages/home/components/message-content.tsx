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
    subscribeToMessages,
    unsubscribeToMessages
  } = useMessageStore()
  const { authUser, typingUsers } = useAuthStore();
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
      console.log("[MessageContent] Subscribing to messages...");
      subscribeToMessages()
      return () => {
        console.log("[MessageContent] Unsubscribing to messages...");
        unsubscribeToMessages()
      }
    }, [messages, subscribeToMessages, unsubscribeToMessages]);
  

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
          className={`chat ${message.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
          ref={index === 0 ? topMessageRef : messageEndRef} // Use refs only when needed
        >
          <IndividualChat message={message} selectedUser={selectedUser} />
        </div>
      ))}
      {selectedUser && typingUsers.includes(selectedUser?._id) && (
        <div className="flex gap-1.5">
          <div className="chat-image avatar">
            <div className="size-10 rounded-full border flex">
              <img
                src={selectedUser?.profilePic || "/avatar.png"}
                alt="profile pic"
              />
            </div>
          </div>
           {/* Typing indicator dots */}
           <div className="space-x-1 rounded-2xl p-1 grid place-items-center">
              <div className="flex items-center space-x-1 bg-base-200 p-3 rounded-2xl animate-pulse duration-1000">
                <div className="h-1 w-1 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="h-1 w-1 bg-gray-400 rounded-full animate-bounce delay-200" />
                <div className="h-1 w-1 bg-gray-400 rounded-full animate-bounce delay-300" />
              </div>
            </div>
        </div>
      )}
    </div>
   );
}
 
export default MessageContent;