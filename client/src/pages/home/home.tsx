
import Sidebar from "../../components/sidebar";
import NoChatSelected from "../../components/no-chat-selected";
import ChatContainer from "./components/chat-container";
import { useParams } from "react-router-dom";
import { useMessageStore } from "../../store/useMessageStore";
import { useEffect } from "react";
import NotFound from "../../components/not-found";
import ChatHeader from "./components/chat-header";
import MessageSkeleton from "../../components/skeletons/message-skeleton";
import MessageInput from "./components/message-input";

const HomePage = () => {
  const { conversationId } = useParams(); 
  const { getConversation, validConversationId, isConversationLoading, isMessagesLoading } = useMessageStore()

  useEffect(() => {

    if (conversationId && !validConversationId) {
      getConversation(conversationId); // Fetch the conversation data based on conversationId
    }
  }, [conversationId, validConversationId, getConversation]);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!conversationId 
              ? <NoChatSelected /> 
              : validConversationId 
              ? <ChatContainer/> 
              : isConversationLoading || isMessagesLoading ? <div className="flex-1 flex flex-col">
              <ChatHeader />
              <MessageSkeleton />
              <MessageInput />
            </div> : <NotFound />
            }
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;