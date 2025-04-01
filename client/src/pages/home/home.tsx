import Sidebar from "../../components/sidebar";
import { useParams } from "react-router-dom";
import { useMessageStore } from "../../store/useMessageStore";
import ChatContainer from "./components/chat-container";
import ChatHeader from "./components/chat-header";
import MessageSkeleton from "../../components/skeletons/message-skeleton";
import MessageInput from "./components/message-input";
import NotFound from "../../components/not-found";
import NoChatSelected from "../../components/no-chat-selected";
import { useGetMessagesQuery } from "../../features/messages/hooks";

const HomePage = () => {
  const { validConversationId } = useMessageStore()
  const { conversationId } = useParams();
  const { isLoading: isMessagesLoading } = useGetMessagesQuery(conversationId || "")
  
  let content;
  if (!conversationId) {
    content = <NoChatSelected />;
  } else {
    content = validConversationId ? (
      <ChatContainer />
    ) : isMessagesLoading ? (
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    ) : (
      <NotFound />
    );
  }

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;