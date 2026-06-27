import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { apiGet } from "@/lib/httpClient";
import { Avatar } from "@/components/ui/Avatar";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  otherUser: any;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export const MessagesPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiGet(`/api/conversations/user/${user.id}`)
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col pt-16">
      {/* Top bar — matches navbar style */}
      <div className="border-b border-[#1E1E1E] px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-[#F5F0E8] font-serif text-2xl">Messages</h1>
          <p className="text-[#F5F0E8]/30 text-xs mt-0.5">Connect with farmers across Karnataka</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-6 py-4 border-b border-[#1E1E1E]">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F5F0E8]/30">🔍</span>
          <input
            placeholder="Search farmers by name or @handle..."
            className="w-full bg-[#111] border border-[#1E1E1E] rounded-xl pl-10 pr-4 py-3.5 text-[#F5F0E8] text-sm placeholder:text-[#F5F0E8]/20 focus:border-[#C9A84C]/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1E1E1E]">
        {loading ? (
           <div className="text-center py-10 text-[#F5F0E8]/40">Loading messages...</div>
        ) : conversations.length === 0 ? (
           <div className="text-center py-10 text-[#F5F0E8]/40">No conversations yet</div>
        ) : conversations.map(conv => (
          <button
            key={conv.id}
            onClick={() => navigate(`/messages/${conv.otherUser.clerkUserId}`)}
            className="w-full px-6 py-4 flex items-center gap-4 hover:bg-[#111] transition-colors text-left"
          >
            {/* Avatar with online dot */}
            <div className="relative flex-shrink-0">
              <Avatar user={conv.otherUser} size={50} />
              <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0A0A0A]" />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-[#F5F0E8] font-semibold' : 'text-[#F5F0E8]/80'}`}>
                  {conv.otherUser.fullName}
                </p>
                <p className="text-[#F5F0E8]/25 text-xs flex-shrink-0 ml-2">{formatRelativeTime(conv.lastMessageAt)}</p>
              </div>
              <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-[#F5F0E8]/70' : 'text-[#F5F0E8]/30'}`}>
                {conv.lastMessage || 'Start a conversation'}
              </p>
            </div>

            {/* Unread badge */}
            {conv.unreadCount > 0 && (
              <div className="w-5 h-5 bg-[#C9A84C] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#0A0A0A] text-xs font-bold">{conv.unreadCount}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessagesPage;
