
import Sidebar from "../components/sidebar";
import NoChatSelected from "../components/no-chat-selected";
import { useMessageStore } from "../store/useMessageStore";

const HomePage = () => {
  const { selectedUser } = useMessageStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : ""}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;