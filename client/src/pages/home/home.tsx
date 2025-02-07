
import Sidebar from "../../components/sidebar";
import { Outlet, useParams } from "react-router-dom";
import { useMessageStore } from "../../store/useMessageStore";
import { useEffect } from "react";

const HomePage = () => {
  const { conversationId } = useParams(); 
  const { getMessages, validConversationId} = useMessageStore()

  useEffect(() => {
    const fetchConversation = async () => {
      if (conversationId && !validConversationId) {
        await getMessages(conversationId); 
      }
    }
    fetchConversation()
  }, [conversationId, validConversationId, getMessages]);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;