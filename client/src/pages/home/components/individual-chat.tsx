
import { EllipsisVertical, Loader, MessageSquare, RefreshCcw } from "lucide-react";
import { formatMessageTime } from "../../../lib/utils";
import { MessagesProps } from "../../../store/types/auth-types";
import { AuthUser, useAuthStore } from "../../../store/useAuthStore";
import { useMessageStore } from "../../../store/useMessageStore";
import { useParams } from "react-router-dom";

interface IndividualChatProps {
  message: MessagesProps,
  selectedUser: AuthUser | null
}

const IndividualChat: React.FC<IndividualChatProps> = ({ message, selectedUser }) => {

  const { authUser, onlineUsers } = useAuthStore()
  const { 
    aiGeneratedResponse, 
    generateAIResponse, 
    isGeneratingAIResponse, 
    selectedMessageId, 
    setText 
  } = useMessageStore()

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
              message.senderId._id === authUser?._id
                ? authUser?.profilePic || "/avatar.png"
                : selectedUser?.profilePic || "/avatar.png"
            }
            alt="profile pic"
          />
          {message.senderId._id === authUser?._id && (
            <span
              className="absolute bottom-0 right-0 size-3 bg-green-500 
              rounded-full ring-2 ring-zinc-900"
            /> 
          )}

          {(message.senderId._id !== authUser?._id) && onlineUsers.includes(selectedUser?._id || "") && (
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
        className={`chat w-full ${message.senderId._id === authUser?._id 
        ? "chat-end" : "chat-start flex items-center gap-1"} group`}
      >
        <div 
          className={`chat-bubble flex flex-col
          ${message.senderId._id === authUser?._id 
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
        {message.senderId._id !== authUser?._id && 
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
            <li onClick={handleGenerateAIResponse}>
              <a>Reply with AI?⭐</a>
            </li>
          </ul>
          </div>
        }
        <dialog id="my_modal_2" className="modal">
          <div className="modal-box max-w-md mx-auto">
            {/* Header/Label */}
            <h3 className="text-lg font-bold text-center mb-4">AI Reply Suggestions</h3>
            {isGeneratingAIResponse ? (
            // Loading State
              <div className="flex flex-col items-center justify-center space-y-4 py-6">
                <span className="text-lg font-medium text-base-content">Generating suggestions...</span>
                <Loader className="animate-spin w-8 h-8 text-primary" />
              </div>
            ) : (
              // AI Generated Responses
              <div className="space-y-3">
                {aiGeneratedResponse?.map((res, index) => (
                  <div
                    key={index}
                    className="
                      p-4 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 
                      transition-colors duration-200 flex items-start space-x-3
                    "
                    onClick={() => {
                      const modal = document.getElementById("my_modal_2");
                      if (modal) (modal as HTMLDialogElement).close(); 
                      setText(res)
                    }}
                  >
                    {/* Icon */}
                    <MessageSquare className="text-primary"/>
                    {/* Response Text */}
                    <p className="text-base-content flex-1">{res}</p>
                  </div>
                ))}
              </div>
            )}
              <button
                className="btn btn-outline btn-primary w-full mt-4 disabled:btn-disabled"
                disabled={isGeneratingAIResponse}
                onClick={async() => {
                  const regenerate = true
                  if (conversationId) {
                    const data = {
                      conversationId,
                      selectedMessageId: selectedMessageId
                    }
                    await generateAIResponse(data, regenerate)
                  }
                }}
              >
               <RefreshCcw size={14}/>
                Regenerate
              </button>
            </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </>
   );
}
 
export default IndividualChat;