
import { EllipsisVertical } from "lucide-react";
import { formatMessageTime } from "../../../lib/utils";
import { MessagesProps } from "../../../store/types/message-types";
import { AuthUser, useAuthStore } from "../../../store/useAuthStore";
import { useMessageStore } from "../../../store/useMessageStore";
import { useParams } from "react-router-dom";
import AIModal from "./ai-modal";

interface IndividualChatProps {
  message: MessagesProps,
  selectedUser: AuthUser | null
}

const IndividualChat: React.FC<IndividualChatProps> = ({ message, selectedUser }) => {

  const { authUser, onlineUsers } = useAuthStore()
  const { generateAIResponse } = useMessageStore()
  const { conversationId } = useParams(); 
  const handleGenerateAIResponse = async() => {
    
    const modal = document.getElementById('my_modal_2') as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
    if (conversationId) {
      const data = {
        conversationId,
        selectedMessageId: message._id
      }
      await generateAIResponse(data)
    }
  }
  return ( 
    <>
      <div className="chat-image avatar">
        <div className="size-10 rounded-full border">
          <img
            src={
              message.senderId === authUser?._id
                ? authUser?.profilePic || "/avatar.png"
                : selectedUser?.profilePic || "/avatar.png"
            }
            alt="profile pic"
          />
          {message.senderId === authUser?._id && (
            <span
              className="absolute bottom-0 right-0 size-3 bg-green-500 
              rounded-full ring-2 ring-zinc-900"
            /> 
          )}

          {(message.senderId !== authUser?._id) && onlineUsers.includes(selectedUser?._id || "") && (
            <span
              className="absolute bottom-0 right-0 size-3 bg-green-500 
              rounded-full ring-2 ring-zinc-900"
            /> 
          )}
        </div>
      </div>
      <div className="chat-header mb-1">
        <time className="text-xs opacity-50 ml-1">
          {formatMessageTime(message.createdAt)}
        </time>
      </div>
      <div 
        className={`chat w-full ${message.senderId === authUser?._id 
        ? "chat-end" : "chat-start flex items-center gap-1"} group`}
      >
        <div 
          className={`chat-bubble flex flex-col
          ${message.senderId === authUser?._id 
          ? 'bg-primary text-primary-content' 
          : "bg-base-200 text-base-content"}`}
        >
          {message.image && (
            <img
              src={message.image}
              alt="Attachment"
              className="sm:max-w-[200px] rounded-md mb-2 relative"
            />  
          )}
          {message.text && <p className="w-full">{message.text}</p>}
        </div>
        {message.senderId !== authUser?._id && 
          <div className="dropdown dropdown-top dropdown-left w-3">
            <EllipsisVertical 
              tabIndex={0} 
              role="button"
              size={20} 
              className="opacity-0 group-hover:opacity-100 transition 
              duration-200 rounded-full hover:bg-base-200 cursor-pointer"
            />
          <ul 
            tabIndex={0} 
            className="
              dropdown-content menu bg-base-100 rounded-box z-[100] w-40 translate-x-10 mr-3 shadow 
              md:translate-x-32"
          >
            <li>
              <button onClick={handleGenerateAIResponse}>Reply with AI? ⭐</button>
            </li>
          </ul>
          </div>
        }
        <AIModal />
      </div>
    </>
   );
}
 
export default IndividualChat;