import { AuthUser } from "../../../store/useAuthStore";

interface TypingIndicatorProps {
  selectedUser: AuthUser
}

const TypingIndicator = ({ selectedUser } : TypingIndicatorProps ) => {
  return ( 
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
   );
}
 
export default TypingIndicator;