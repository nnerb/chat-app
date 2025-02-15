import { X } from "lucide-react";
import { useMessageStore } from "../../../store/useMessageStore";
import { Link } from "react-router-dom";
import { BASE_URL, useAuthStore } from "../../../store/useAuthStore";
import { formatRelativeTime } from "../../../lib/utils";
import { useEffect } from "react";
import { io } from "socket.io-client";

interface UserLoggedOutProps {
  userId: string;
  lastSeen: string;
}

const ChatHeader = () => {
  const { selectedUser, isMessagesLoading } = useMessageStore();
  const { onlineUsers } = useAuthStore()

  useEffect(() => {
    const socket = io(BASE_URL);

    socket.on("userLoggedOut", ({ userId, lastSeen } : UserLoggedOutProps) => {
      if (selectedUser?._id === userId) {
        // Update the selectedUser's lastSeen timestamp
        if (selectedUser) {
          selectedUser.lastSeen = lastSeen;
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedUser]);
  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="chat-image avatar">
            {isMessagesLoading ? (
              <div className="size-10 rounded-full">
                <div className="skeleton w-full h-full rounded-full" />
              </div> 
              ) : (
              <div className="size-10 rounded-full relative">
                <img src={selectedUser?.profilePic || "/avatar.png"} alt={selectedUser?.fullName} />
              </div>
              )
            }
            
            {onlineUsers.includes(selectedUser?._id || "") && (
               <span
               className="absolute bottom-0 right-0 size-3 bg-green-500 
               rounded-full ring-2 ring-zinc-900"
               />
            )}
          </div>

          {/* User info */}
          <div>
            {isMessagesLoading ? (
            <div className="chat-header flex flex-col gap-1">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-14" />
            </div>
            ) : 
            <>
              <h3 className="font-medium">{selectedUser?.fullName}</h3>
              <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser?._id || "") 
                ? "Active now" 
                : selectedUser?.lastSeen && `Active ${formatRelativeTime(selectedUser?.lastSeen)}`} 
              </p>
            </>
            }
            
           
          </div>
        </div>

        {/* Close button */}
        <Link to="/messages">
          <X />
        </Link>
      </div>
    </div>
  );
};
export default ChatHeader;