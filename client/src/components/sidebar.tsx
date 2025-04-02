import { useState } from "react";

import { Users } from "lucide-react";
import SidebarSkeleton from "./skeletons/sidebar-skeleton";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import { useParams } from "react-router-dom";;
import { formatRelativeTime } from "../lib/utils";
import { useGetUsersQuery } from "../features/users/hooks";
import { useUserStore } from "../store/useUserStore";
import { useConversationQuery } from "../features/conversation/hooks";

const Sidebar = () => {
  const { selectedUser } = useMessageStore();
  const { users } = useUserStore()
  const { onlineUsers, authUser } = useAuthStore(); 
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const { conversationId } = useParams()
  const { isLoading: isUsersLoading } = useGetUsersQuery()
  const { mutate: startConversation } = useConversationQuery()

  const filteredUsers = (showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users
  ).sort((a, b) => {
    const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
    const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
    return timeB - timeA;
  })

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-16 md:w-20 xl:w-72 border-r border-base-300 flex flex-col transition-all duration-200 z-0">
      <div className="border-b border-base-300 w-full px-5 py-4 md:py-4.5">
        <div className="flex items-center justify-center xl:justify-start gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden xl:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden xl:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({ onlineUsers.length - 1 || 0 } online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => startConversation(user._id)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors  
              ${selectedUser?._id === user._id && conversationId ? "bg-base-300 ring-1 ring-base-300 cursor-auto" : "cursor-pointer"}
            `}
            disabled={selectedUser?._id === user._id && !!conversationId}
          >
            <div className="relative mx-auto xl:mx-0 shrink-0">
              <img
                src={user.profilePicture || "/avatar.png"}
                alt={user.name}
                className="size-10 md:size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden xl:flex xl:flex-col xl:items-start overflow-hidden w-full">
              <h2 className="font-medium truncate">{user.name}</h2>
              {/* {onlineUsers.includes(user._id) ? "Online" : "Offline"} */}
              <div className="flex gap-1 w-full items-center">
                <span className="text-sm text-zinc-400 text-start truncate">
                  {user.lastMessage?.sender === authUser?._id && user.lastMessage?.content && "You: "}
                  {user.lastMessage?.content || "Start a conversation"}
                </span>
                <p className="text-sm text-zinc-400 shrink-0"> 
                  {user.lastMessage?.timestamp && "• " }
                  {user.lastMessage && formatRelativeTime(user.lastMessage?.timestamp ?? new Date().toISOString())}
                </p>
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;