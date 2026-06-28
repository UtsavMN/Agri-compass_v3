import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";

export const MessagesPage = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = await getToken();
      const base = import.meta.env.VITE_API_BASE_URL || "";
      try {
        const data = await fetch(
          `${base}/api/conversations`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).then(r => r.json());
        setConversations(data.conversations ?? data ?? []);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const token = await getToken();
      const base = import.meta.env.VITE_API_BASE_URL || "";
      try {
        const data = await fetch(
          `${base}/api/users/search?q=${encodeURIComponent(searchQuery)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).then(r => r.json());
        setSearchResults((data.users ?? data ?? []).filter((u: any) => u.clerkUserId !== user?.id));
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const formatTime = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">

      {/* Header */}
      <div className="border-b border-[#1E1E1E] px-5 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif text-[#F5F0E8]">Messages</h1>
          <p className="text-[#F5F0E8]/25 text-xs mt-0.5">Connect with farmers across Karnataka</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 py-3 border-b border-[#1E1E1E]">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F5F0E8]/20 text-sm">🔍</span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search farmers by name or @handle..."
            className="w-full bg-[#111] border border-[#1E1E1E] rounded-xl pl-9 pr-4 py-3 text-[#F5F0E8] text-sm placeholder:text-[#F5F0E8]/20 focus:border-[#C9A84C]/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="border-b border-[#1E1E1E] bg-[#080808]">
          <p className="px-4 pt-3 pb-1 text-xs text-[#F5F0E8]/20 uppercase tracking-wider">Farmers</p>
          {searchResults.map((u: any) => (
            <button key={u.clerkUserId || u.id}
              onClick={() => navigate(`/messages/${u.clerkUserId || u.id}`)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#111] transition-colors border-b border-[#1E1E1E] last:border-0">
              <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {u.profilePictureUrl || u.profile_picture_url
                  ? <img src={u.profilePictureUrl || u.profile_picture_url} className="w-full h-full object-cover" alt="" />
                  : <span className="text-[#C9A84C] font-semibold text-sm">{(u.fullName || u.full_name || "?")[0]}</span>
                }
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-[#F5F0E8] text-sm font-medium truncate">{u.fullName || u.full_name}</p>
                <p className="text-[#F5F0E8]/30 text-xs">@{u.usernameHandle || u.username_handle} · {u.district}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1E1E1E]">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-4 flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-[#1E1E1E] flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3 bg-[#1E1E1E] rounded mb-2 w-32" />
                <div className="h-2.5 bg-[#1E1E1E] rounded w-48" />
              </div>
            </div>
          ))
        ) : conversations.length === 0 && searchQuery === "" ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <p className="text-5xl mb-4">💬</p>
            <p className="text-[#F5F0E8]/60 font-medium mb-2">No messages yet</p>
            <p className="text-[#F5F0E8]/25 text-sm">Search for a farmer above to start a conversation</p>
          </div>
        ) : (
          conversations.map((conv: any) => (
            <button key={conv.id}
              onClick={() => navigate(`/messages/${conv.otherUser?.clerkUserId || conv.otherUser?.id}`)}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#0D0D0D] transition-colors text-left">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 overflow-hidden flex items-center justify-center">
                  {conv.otherUser?.profilePictureUrl || conv.otherUser?.profile_picture_url
                    ? <img src={conv.otherUser.profilePictureUrl || conv.otherUser.profile_picture_url} className="w-full h-full object-cover" alt="" />
                    : <span className="text-[#C9A84C] font-semibold">{(conv.otherUser?.fullName || conv.otherUser?.full_name || "?")[0]}</span>
                  }
                </div>
                {conv.otherUser?.isOnline && (
                  <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0A0A0A]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-[#F5F0E8] font-semibold" : "text-[#F5F0E8]/70"}`}>
                    {conv.otherUser?.fullName || conv.otherUser?.full_name}
                  </p>
                  <p className="text-[#F5F0E8]/20 text-xs flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt || conv.last_message_at)}</p>
                </div>
                <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-[#F5F0E8]/60" : "text-[#F5F0E8]/25"}`}>
                  {conv.lastMessage || conv.last_message || "Start a conversation"}
                </p>
              </div>
              {(conv.unreadCount || conv.unread_count) > 0 && (
                <div className="w-5 h-5 bg-[#C9A84C] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0A0A0A] text-xs font-bold">{conv.unreadCount || conv.unread_count}</span>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
