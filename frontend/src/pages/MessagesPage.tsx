import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageSquare } from "lucide-react";
import { apiGet } from "@/lib/httpClient";
import { useUser } from "@clerk/clerk-react";

interface UserProfile {
  clerkUserId: string;
  fullName: string;
  usernameHandle: string;
  profilePictureUrl?: string;
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
  };
  latestMessage: string;
  updatedAt: string;
  unreadCount: number;
}

export const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    apiGet("/api/conversations")
      .then(d => setConversations(d || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      apiGet(`/api/users/search?q=${searchQuery}`)
        .then(d => setSearchResults((d.users || []).filter((u: UserProfile) => u.clerkUserId !== user?.id)))
        .catch(console.error);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, user?.id]);

  const handleSelectUser = (userId: string) => {
    navigate(`/messages/${userId}`);
  };

  return (
    <div className="pt-20 min-h-screen bg-[#0A0A0A] max-w-2xl mx-auto px-4 pb-24">
      <h1 className="text-[#F5F0E8] font-bold text-2xl mb-6">Messages</h1>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9A84C]" />
        <input
          type="text"
          placeholder="Search farmers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1E1E1E] border-none rounded-xl py-3 pl-10 pr-4 text-[#F5F0E8] placeholder:text-[#F5F0E8]/30 focus:ring-1 focus:ring-[#C9A84C]/50 transition-all text-sm"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E1E1E] border border-white/5 rounded-xl shadow-xl z-10 overflow-hidden">
            {searchResults.map((result) => (
              <button
                key={result.clerkUserId}
                onClick={() => handleSelectUser(result.clerkUserId)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <img src={result.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.clerkUserId}`} className="w-8 h-8 rounded-full bg-[#0A0A0A]" />
                <div>
                  <p className="text-sm font-semibold text-[#F5F0E8]">{result.fullName}</p>
                  <p className="text-[10px] text-[#F5F0E8]/40">@{result.usernameHandle}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-[#F5F0E8]/50 text-center text-xs py-8">Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#F5F0E8]/30">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-semibold uppercase tracking-widest text-[#F5F0E8]/50">No Messages Yet</p>
            <p className="text-[10px] mt-2">Search for a farmer to start a conversation</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectUser(conv.otherUser.id)}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-[#1E1E1E] transition-colors border border-transparent hover:border-white/5 text-left group"
            >
              <img src={conv.otherUser.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.otherUser.id}`} className="w-12 h-12 rounded-full border border-[#C9A84C]/20" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-[#F5F0E8] truncate">{conv.otherUser.fullName}</p>
                  <p className="text-[10px] text-[#F5F0E8]/30 whitespace-nowrap">
                    {new Date(conv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-[#F5F0E8] font-medium' : 'text-[#F5F0E8]/50'}`}>
                    {conv.latestMessage || 'Started a conversation'}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="bg-[#C9A84C] text-[#0A0A0A] text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
export default MessagesPage;
