import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { motion } from "framer-motion";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  pending?: boolean;
}

export const ChatPage = () => {
  const { userId: otherUserId } = useParams<{ userId: string }>();
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const stompRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // Setup conversation and load history
  useEffect(() => {
    if (!otherUserId || !user?.id) return;
    let isMounted = true;

    const setup = async () => {
      setLoading(true);
      const token = await getToken();
      const base = import.meta.env.VITE_API_BASE_URL ?? "";
      try {
        // Get other user's profile
        const profileData = await fetch(`${base}/api/users/${otherUserId}/public`).then(r => r.json());
        if (isMounted) setOtherUser(profileData.profile ?? profileData);

        // Get or create conversation
        const convData = await fetch(`${base}/api/conversations/user/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json());
        const convId = convData.conversationId ?? convData.id;
        if (isMounted) setConversationId(convId);

        // Load messages
        const msgData = await fetch(`${base}/api/messages/${convId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json());
        if (isMounted) setMessages(msgData.messages ?? msgData ?? []);

        // Mark as read
        fetch(`${base}/api/messages/${convId}/read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      } catch (err) {
        console.error("Chat setup failed:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          scrollToBottom();
        }
      }
    };
    setup();
    return () => { isMounted = false; };
  }, [otherUserId, user?.id]);

  // WebSocket — uses env variable, not hardcoded localhost
  useEffect(() => {
    if (!conversationId || !user?.id) return;
    const base = import.meta.env.VITE_API_BASE_URL ?? "";

    const client = new Client({
      webSocketFactory: () => new SockJS(`${base}/ws`),
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/messages.${user.id}`, frame => {
          const msg: Message = JSON.parse(frame.body);
          if (msg.conversationId === conversationId) {
            setMessages(prev => {
              const exists = prev.some(m => m.id === msg.id);
              return exists ? prev : [...prev, msg];
            });
            scrollToBottom();
          }
        });
      },
      onDisconnect: () => setConnected(false),
      reconnectDelay: 3000,
    });

    client.activate();
    stompRef.current = client;
    return () => { client.deactivate(); };
  }, [conversationId, user?.id]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !conversationId) return;
    const content = input.trim();
    setInput("");

    // Optimistic UI update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: user!.id,
      content,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    // Send via STOMP if connected, otherwise via REST
    if (stompRef.current?.connected) {
      stompRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ conversationId, recipientId: otherUserId, content }),
      });
    } else {
      const base = import.meta.env.VITE_API_BASE_URL ?? "";
      getToken().then(token => {
        fetch(`${base}/api/messages/${conversationId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ content, recipientId: otherUserId }),
        }).catch(console.error);
      });
    }

    if (inputRef.current) inputRef.current.style.height = "auto";
  }, [input, conversationId, otherUserId, user]);

  // Group messages by date label
  const groupByDate = (msgs: Message[]) => {
    const groups: Record<string, Message[]> = {};
    msgs.forEach(msg => {
      const d = new Date(msg.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      let label: string;
      if (d.toDateString() === today.toDateString()) label = "Today";
      else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
      else label = d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
      if (!groups[label]) groups[label] = [];
      groups[label].push(msg);
    });
    return groups;
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="h-screen bg-[#0A0A0A] flex flex-col">
      <div className="glass-panel sticky top-0 z-10 px-5 py-3 border-b border-[#1E1E1E] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/messages")} className="text-[#F5F0E8]/40 hover:text-[#C9A84C] transition-colors p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1E1E1E] animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3 bg-[#1E1E1E] rounded w-24 animate-pulse" />
                <div className="h-2 bg-[#1E1E1E] rounded w-16 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                  {otherUser?.profilePictureUrl || otherUser?.profile_picture_url
                    ? <img src={otherUser.profilePictureUrl || otherUser.profile_picture_url} className="w-full h-full object-cover" alt="" />
                    : <span className="text-[#C9A84C] text-sm font-semibold">{(otherUser?.fullName || otherUser?.full_name || "?")[0]}</span>
                  }
                </div>
                {connected && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0A0A0A]" />
                )}
              </div>
              <div>
                <p className="text-[#F5F0E8] text-sm font-semibold">{otherUser?.fullName || otherUser?.full_name}</p>
                <p className="text-[#F5F0E8]/30 text-xs">@{otherUser?.usernameHandle || otherUser?.username_handle} · {otherUser?.district}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 bg-[#111] px-2 py-1 rounded-full border border-[#1E1E1E]">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${connected ? "bg-green-400" : "bg-[#C9A84C] animate-pulse"}`} />
          <span className="text-[#F5F0E8]/30 text-[10px] uppercase font-bold tracking-wider">{connected ? "Live" : "Connecting..."}</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[#C9A84C] animate-pulse text-2xl">💬</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center mb-4">
              {otherUser?.profilePictureUrl || otherUser?.profile_picture_url
                ? <img src={otherUser.profilePictureUrl || otherUser.profile_picture_url} className="w-full h-full rounded-full object-cover" alt="" />
                : <span className="text-[#C9A84C] text-xl font-semibold">{(otherUser?.fullName || otherUser?.full_name || "?")[0]}</span>
              }
            </div>
            <p className="text-[#F5F0E8]/60 font-medium mb-1">{otherUser?.fullName || otherUser?.full_name}</p>
            <p className="text-[#F5F0E8]/25 text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          Object.entries(groupByDate(messages)).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-[#1E1E1E]" />
                <span className="text-[#F5F0E8]/15 text-xs px-2">{date}</span>
                <div className="flex-1 h-px bg-[#1E1E1E]" />
              </div>

              <div className="space-y-1.5">
                {(msgs as Message[]).map((msg, i) => {
                  const isMe = msg.senderId === user?.id;
                  const nextMsg = (msgs as Message[])[i + 1];
                  const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

                  return (
                    <motion.div key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>

                      {/* Other user avatar — only on last msg in group */}
                      {!isMe && (
                        <div className="w-7 flex-shrink-0 mb-1">
                          {isLastInGroup && (
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#C9A84C]/10 flex items-center justify-center">
                              {otherUser?.profilePictureUrl || otherUser?.profile_picture_url
                                ? <img src={otherUser.profilePictureUrl || otherUser.profile_picture_url} className="w-full h-full object-cover" alt="" />
                                : <span className="text-[#C9A84C] text-xs font-semibold">{(otherUser?.fullName || otherUser?.full_name || "?")[0]}</span>
                              }
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-[#C9A84C] text-[#0A0A0A] font-medium rounded-2xl rounded-br-sm shadow-[0_2px_10px_rgba(201,168,76,0.15)]"
                            : "glass-panel text-[#F5F0E8] rounded-2xl rounded-bl-sm"
                        } ${msg.pending ? "opacity-60" : ""}`}>
                          {msg.content}
                        </div>
                        {isLastInGroup && (
                          <p className="text-[#F5F0E8]/15 text-xs mt-1 px-1">
                            {formatTime(msg.createdAt)}{isMe && !msg.pending ? " ✓" : ""}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="glass-panel flex-shrink-0 px-4 py-3 sticky bottom-0">
        <div className="flex items-end gap-3 bg-[#111]/80 backdrop-blur-md border border-[#1E1E1E] rounded-2xl px-4 py-3 focus-within:border-[#C9A84C]/40 focus-within:ring-2 focus-within:ring-[#C9A84C]/10 transition-all shadow-inner">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 bg-transparent text-[#F5F0E8] text-sm placeholder:text-[#F5F0E8]/20 focus:outline-none resize-none max-h-28 overflow-y-auto"
            onInput={e => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 112)}px`;
            }}
          />
          <button onClick={sendMessage}
            disabled={!input.trim()}
            aria-label="Send message"
            className="w-8 h-8 bg-[#C9A84C] rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-20 hover:bg-[#D4B86A] hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(201,168,76,0.4)] transition-all">
            <span className="text-[#0A0A0A] font-bold text-base leading-none mb-0.5">↑</span>
          </button>
        </div>
        {!connected && (
          <p className="text-center text-xs text-[#F5F0E8]/20 mt-2">Reconnecting to live chat...</p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
