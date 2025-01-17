import { X } from "lucide-react";
import { useMessageStore } from "../../../store/useMessageStore";
import { Link } from "react-router-dom";

const ChatHeader = () => {
  const { selectedUser } = useMessageStore();
  const onlineUsers: string[] = [];

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser?.profilePic || "/avatar.png"} alt={selectedUser?.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser?.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser?._id || "") ? "Online" : "Offline"}
            </p>
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