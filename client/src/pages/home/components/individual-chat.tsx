
import { formatMessageTime } from "../../../lib/utils";
import { MessagesProps } from "../../../store/types/auth-types";
import { AuthUser, useAuthStore } from "../../../store/useAuthStore";

interface IndividualChatProps {
  message: MessagesProps,
  selectedUser: AuthUser | null
}

const IndividualChat: React.FC<IndividualChatProps> = ({ message, selectedUser }) => {

  const { authUser } = useAuthStore()
  return ( 
    <>
      <div className=" chat-image avatar">
        <div className="size-10 rounded-full border">
          <img
            src={
              message.senderId._id === authUser?._id
                ? authUser?.profilePic || "/avatar.png"
                : selectedUser?.profilePic || "/avatar.png"
            }
            alt="profile pic"
          />
        </div>
      </div>
      <div className="chat-header mb-1">
        <time className="text-xs opacity-50 ml-1">
          {formatMessageTime(message.createdAt)}
        </time>
      </div>
      <div className={`chat-bubble flex flex-col ${message.senderId._id === authUser?._id && 'bg-primary text-primary-content' }`}>
        {message.image && (
          <img
            src={message.image}
            alt="Attachment"
            className="sm:max-w-[200px] rounded-md mb-2"
          />
        )}
        {message.text && <p>{message.text}</p>}
      </div>
    </>
   );
}
 
export default IndividualChat;