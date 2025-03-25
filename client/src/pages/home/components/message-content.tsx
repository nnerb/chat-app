import { ArrowDown, Loader2 } from "lucide-react";
import { useMessageStore } from "../../../store/useMessageStore";
import IndividualChat from "./individual-chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useParams } from "react-router-dom";
import TypingIndicator from "./typing-indicator";
import { formatRelativeTime } from "../../../lib/utils";

const MessageContent = () => {
  const { 
    messages, 
    isFetchingMoreMessages, 
    hasMoreMessages,
    isMessagesLoading,
    fetchMoreMessages,
    currentPage,
    selectedUser,
    isSendingMessage
  } = useMessageStore()
  const { authUser, typingUsers, socket } = useAuthStore();

  const messageEndRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const observer = useRef<IntersectionObserver | null>(null)
  const { conversationId } = useParams()
  const [isBottom, setIsBottom] = useState(false)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  
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

  // Observer to detect if the bottom (messageEndRef) is in view
  useEffect(() => {
    const bottomObserver = new IntersectionObserver(([entry]) => {
      setIsBottom(entry.isIntersecting);
    },{ threshold: 0.1 });
    const currentBottomRef = bottomRef.current;
    if (currentBottomRef) {
      bottomObserver.observe(currentBottomRef);
    }
    return () => { 
      if (currentBottomRef) {
        bottomObserver.unobserve(currentBottomRef);
      }
    };
  }, []);
  
  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!socket || !conversationId) return;
  
    const lastMessageElement = lastMessageRef.current;
    if (!lastMessageElement) return;
  
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          socket.emit("seenMessage", { conversationId });
        }
      },
      { threshold: 1.0 }
    );
  
    observer.observe(lastMessageElement);
  
    return () => observer.disconnect();
  }, [socket, conversationId, messages]); 

  if (selectedUser === null) return null;

  return ( 
    <div className="flex-1 overflow-y-scroll p-4 space-y-6 overflow-x-hidden relative">
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
          {messages.length - 1 === index 
            ? <IndividualChat message={message} selectedUser={selectedUser} lastMessageRef={lastMessageRef} /> 
            : <IndividualChat message={message} selectedUser={selectedUser} /> 
          }
          
          {message.senderId === authUser?._id && messages.length - 1 === index && (
            <div className="chat-header mb-1 absolute right-0 translate-y-full pt-5 -translate-x-5">
              <span className="text-xs">
                {isSendingMessage ? 
                  <span className="flex items-center space-x-1">
                  <p>Sending...</p>
                  <Loader2 className="animate-spin h-3 w-3"/>
                  </span> :  
                  <> 
                    {message.status === "sent" &&  `Sent ${formatRelativeTime(message.createdAt)}`}
                    {message.status === "delivered" && "Delivered"} 
                    {message.status === "seen" && 
                    <span className="avatar h-4 w-4 rounded-full ">
                      <img 
                        src={selectedUser?.profilePic || "/avatar.png"} 
                        alt={selectedUser?.fullName}
                        className="rounded-full"
                      />
                    </span>
                    } 
                  </> 
                }
              </span>
            </div>
          )}
        </div>
      ))}
      {!isBottom && !isMessagesLoading && (
        <button className="grid place-items-center w-full sticky bottom-0 cursor-pointer" onClick={() => scrollToBottom()}>
        {selectedUser && typingUsers.includes(selectedUser?._id) ? (
          <div className="space-x-1 rounded-2xl grid place-items-center sticky bottom-0 w-full">
            <ul className="flex items-center space-x-1 bg-base-200 p-3 rounded-2xl animate-pulse duration-1000">
              <li className="h-1 w-1 bg-gray-400 rounded-full animate-bounce delay-100" />
              <li className="h-1 w-1 bg-gray-400 rounded-full animate-bounce delay-200" />
              <li className="h-1 w-1 bg-gray-400 rounded-full animate-bounce delay-300" />
            </ul>
          </div>
        ) : <ArrowDown className="bg-base-200 rounded-full p-1"/> }
      </button>
      )}
      <div ref={bottomRef}>
        {typingUsers.includes(selectedUser._id) && (
          <TypingIndicator selectedUser={selectedUser} />
        )}
      </div>
    </div>
   );
}
 
export default MessageContent;