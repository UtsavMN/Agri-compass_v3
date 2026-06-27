import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { apiGet, apiPost } from "@/lib/httpClient";
import { Avatar } from "@/components/ui/Avatar";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  pending?: boolean;
}

export const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const currentUserId = user?.id;
  const otherUserId = userId;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    apiGet(`/api/users/${otherUserId}/public`).then(d => setOtherUser(d.profile)).catch(console.error);

    apiGet(`/api/conversations/user/${otherUserId}`)
      .then(d => {
        setConversationId(d.id);
        return apiGet(`/api/messages/${d.id}`);
      })
      .then(msgs => {
        setMessages(msgs || []);
        scrollToBottom();
      })
      .catch(console.error);

    const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
    const wsUrl = apiBase ? apiBase.replace('https://', 'wss://').replace('http://', 'ws://') : `ws://${window.location.host}`;
    const socket = new SockJS(`${apiBase || ''}/ws/messages`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {
        console.log(str);
      },
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/messages.${currentUserId}`, (message) => {
          if (message.body) {
            const parsedMessage = JSON.parse(message.body);
            setMessages(prev => {
              if (prev.some(m => m.id === parsedMessage.id)) return prev;
              return [...prev, parsedMessage];
            });
            scrollToBottom();
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onWebSocketError: () => setConnected(false),
    });
    
    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [otherUserId, currentUserId]);

  useEffect(() => {
    if (conversationId) {
      apiPost(`/api/messages/${conversationId}/read`, {}).catch(console.error);
    }
  }, [conversationId, messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const content = input;
    setInput("");

    // optimistic UI update could go here

    try {
      const res = await apiPost(`/api/messages/${conversationId}`, { content });
      setMessages(prev => [...prev, res]);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send", error);
    }
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    msgs.forEach(msg => {
      const date = new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-[#0A0A0A] flex flex-col">

      {/* Chat header */}
      <div className="flex-shrink-0 bg-[#0A0A0A] border-b border-[#1E1E1E] px-4 py-3.5 flex items-center gap-3">
        <button onClick={() => navigate('/messages')} className="w-8 h-8 flex items-center justify-center text-[#F5F0E8]/40 hover:text-[#F5F0E8] transition-colors rounded-lg hover:bg-[#111]">
          ←
        </button>

        <button onClick={() => navigate(`/profile/${otherUserId}`)} className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Avatar user={otherUser} size={38} />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0A0A0A]" />
          </div>
          <div className="text-left">
            <p className="text-[#F5F0E8] font-semibold text-sm">{otherUser?.fullName || 'User'}</p>
            <p className="text-[#F5F0E8]/30 text-xs">@{otherUser?.usernameHandle} · {otherUser?.district}</p>
          </div>
        </button>

        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-[#F5F0E8]/20 text-xs">{connected ? 'Live' : 'Reconnecting'}</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#1E1E1E]" />
              <span className="text-[#F5F0E8]/15 text-xs px-2">{date}</span>
              <div className="flex-1 h-px bg-[#1E1E1E]" />
            </div>

            <div className="space-y-1.5">
              {(msgs as Message[]).map((msg, i) => {
                const isMe = msg.senderId === currentUserId;
                const prevMsg = (msgs as Message[])[i - 1];
                const showAvatar = !isMe && prevMsg?.senderId !== msg.senderId;
                const isLastInGroup = !(msgs as Message[])[i + 1] || (msgs as Message[])[i + 1].senderId !== msg.senderId;

                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {/* Other user avatar — only show on last message in group */}
                    {!isMe && (
                      <div className="w-7 flex-shrink-0 mb-1">
                        {isLastInGroup && <Avatar user={otherUser!} size={28} />}
                      </div>
                    )}

                    <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                        isMe
                          ? 'bg-[#C9A84C] text-[#0A0A0A] font-medium rounded-2xl rounded-br-sm'
                          : 'bg-[#161616] text-[#F5F0E8] border border-[#1E1E1E] rounded-2xl rounded-bl-sm'
                      } ${msg.pending ? 'opacity-60' : ''}`}>
                        {msg.content}
                      </div>
                      {isLastInGroup && (
                        <p className="text-[#F5F0E8]/15 text-xs mt-1 px-1">
                          {formatTime(msg.createdAt)}{isMe && !msg.pending ? ' ✓' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 bg-[#0A0A0A] border-t border-[#1E1E1E] px-4 py-3">
        <div className="flex items-end gap-3 bg-[#111] border border-[#1E1E1E] rounded-2xl px-4 py-3 focus-within:border-[#C9A84C]/30 transition-colors">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
            placeholder="Message..."
            rows={1}
            className="flex-1 bg-transparent text-[#F5F0E8] text-sm placeholder:text-[#F5F0E8]/20 focus:outline-none resize-none max-h-28 overflow-y-auto"
            onInput={e => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 112) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-8 h-8 bg-[#C9A84C] rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-25 hover:bg-[#D4B86A] transition-all"
          >
            <span className="text-[#0A0A0A] text-base font-bold">↑</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
