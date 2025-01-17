
import Sidebar from "../../components/sidebar";
import NoChatSelected from "../../components/no-chat-selected";
import ChatContainer from "./components/chat-container";
import { useParams } from "react-router-dom";

const HomePage = () => {
  const { conversationId } = useParams(); 

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!conversationId ? <NoChatSelected /> : <ChatContainer/>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;