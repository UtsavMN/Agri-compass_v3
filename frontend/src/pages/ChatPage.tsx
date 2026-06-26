import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Send } from "lucide-react";
import { apiGet, apiPost } from "@/lib/httpClient";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    if (!userId || !user?.id) return;

    // Load other user profile
    apiGet(`/api/users/${userId}/public`).then(d => setOtherUser(d.profile)).catch(console.error);

    // Get or create conversation
    apiGet(`/api/conversations/user/${userId}`)
      .then(d => {
        setConversationId(d.id);
        return apiGet(`/api/messages/${d.id}`);
      })
      .then(msgs => {
        setMessages(msgs || []);
        scrollToBottom();
      })
      .catch(console.error);

    // Setup WebSocket
    const socket = new SockJS('http://localhost:8080/ws/messages');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {
        console.log(str);
      },
      onConnect: () => {
        client.subscribe(`/topic/messages.${user.id}`, (message) => {
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
    });
    
    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [userId, user?.id]);

  useEffect(() => {
    if (conversationId) {
      // mark as read
      apiPost(`/api/messages/${conversationId}/read`, {}).catch(console.error);
    }
  }, [conversationId, messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId) return;

    const content = newMessage;
    setNewMessage("");

    try {
      const res = await apiPost(`/api/messages/${conversationId}`, { content });
      setMessages(prev => [...prev, res]);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] max-w-2xl mx-auto border-x border-white/5 relative">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-[#0f0f0b]/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10 pt-safe-top">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#F5F0E8]/50 hover:text-[#C9A84C] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {otherUser && (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${userId}`)}>
            <img src={otherUser.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} className="w-8 h-8 rounded-full border border-[#C9A84C]/20" />
            <div>
              <p className="text-sm font-semibold text-[#F5F0E8] leading-none">{otherUser.fullName}</p>
              <p className="text-[10px] text-[#F5F0E8]/40 mt-1">@{otherUser.usernameHandle}</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pt-[5rem] pb-[5rem] space-y-4">
        {messages.map((msg, idx) => {
          const isMine = msg.senderId === user?.id;
          const showDate = idx === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[idx-1].createdAt).toDateString();
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-6">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#F5F0E8]/30 bg-[#1E1E1E] px-3 py-1 rounded-full">
                    {new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-[#C9A84C] text-[#0A0A0A] rounded-tr-sm' : 'bg-[#1E1E1E] text-[#F5F0E8] border border-white/5 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <span className="text-[8px] font-semibold text-[#F5F0E8]/30 mx-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-[#0f0f0b]/80 backdrop-blur-md pb-safe-bottom">
        <div className="flex items-end gap-2 bg-[#1E1E1E] border border-white/5 p-1 rounded-2xl">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write a message..."
            className="flex-1 bg-transparent border-none py-3 px-4 text-sm text-[#F5F0E8] placeholder:text-[#F5F0E8]/30 focus:ring-0"
          />
          <button 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-3 m-1 bg-[#C9A84C] text-[#0A0A0A] rounded-xl disabled:opacity-30 disabled:bg-[#1E1E1E] disabled:text-[#F5F0E8]/30 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
