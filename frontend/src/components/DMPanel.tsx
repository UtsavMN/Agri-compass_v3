import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { MessageSquare, X, ArrowLeft } from "lucide-react";

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
  };
  lastMessage: string;
  unread: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

const Avatar = ({ user, size = 40 }: { user: any, size?: number }) => (
  user.profilePictureUrl
    ? <img src={user.profilePictureUrl} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} alt={user.fullName} />
    : <div
        className="rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center font-semibold text-[#C9A84C] shrink-0"
        style={{ width: size, height: size }}
      >
        {user.fullName?.[0]?.toUpperCase() || '?'}
      </div>
);

export const DMPanel = () => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    // Configure STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_API_BASE_URL + "/ws"),
      onConnect: () => {
        // Subscribe to personal queue
        client.subscribe(`/user/${user.id}/queue/messages`, (message: IMessage) => {
          const newMessage: Message = JSON.parse(message.body);
          setMessages(prev => [...prev, newMessage]);
          
          if (!open || activeConv?.otherUser.id !== newMessage.senderId) {
            setUnreadCount(prev => prev + 1);
          }
          scrollToBottom();
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [user?.id, open, activeConv]);

  const sendMessage = () => {
    if (!input.trim() || !activeConv || !stompClient.current || !user) return;
    
    stompClient.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        conversationId: activeConv.id,
        recipientId: activeConv.otherUser.id,
        content: input.trim(),
      }),
    });
    
    // Optimistic UI update
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: user.id,
      content: input.trim(),
      createdAt: new Date().toISOString(),
    }]);
    
    setInput("");
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="relative z-[100]">
      {/* Trigger Button */}
      <button
        onClick={() => { setOpen(!open); setUnreadCount(0); }}
        className="relative p-2 rounded-xl bg-[#12120e] border border-earth-border hover:border-gold-400/50 hover:bg-[#1a1a14] transition-all group"
      >
        <MessageSquare className="w-5 h-5 text-gold-100 group-hover:text-gold-400" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gold-400 rounded-full text-[#0A0A0A] text-xs font-black flex items-center justify-center shadow-lg"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      {/* DM Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-14 right-0 w-[350px] h-[500px] bg-[#0A0A0A] border border-[#1E1E1E] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col origin-top-right"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1E1E1E] bg-[#111111] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                {activeConv && (
                  <button onClick={() => setActiveConv(null)} className="text-[#C9A84C] hover:bg-[#C9A84C]/10 p-1.5 rounded-lg transition-colors">
                    <ArrowLeft size={16} />
                  </button>
                )}
                <h3 className="text-[#F5F0E8] font-black text-sm uppercase tracking-widest">
                  {activeConv ? activeConv.otherUser.fullName : "Messages"}
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#F5F0E8]/40 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conversation List */}
            {!activeConv && (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#1E1E1E] flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-[#C9A84C]/30" />
                    </div>
                    <p className="text-[#F5F0E8] font-bold text-sm mb-1">No messages yet</p>
                    <p className="text-[#F5F0E8]/40 text-xs leading-relaxed">Connect with other farmers in the community to start chatting.</p>
                  </div>
                ) : (
                  conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => { setActiveConv(conv); scrollToBottom(); }}
                      className="w-full px-5 py-4 flex gap-4 items-center hover:bg-[#111111] transition-colors border-b border-[#1E1E1E]"
                    >
                      <Avatar user={conv.otherUser} size={44} />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[#F5F0E8] text-sm font-bold truncate mb-0.5">{conv.otherUser.fullName}</p>
                        <p className="text-[#F5F0E8]/40 text-xs truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unread && <div className="w-2.5 h-2.5 bg-[#C9A84C] rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(201,168,76,0.6)]" />}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Active Chat View */}
            {activeConv && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#0f0f0b]">
                  {messages.map(msg => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "bg-[#C9A84C] text-[#0A0A0A] font-medium rounded-tr-sm"
                            : "bg-[#1E1E1E] text-[#F5F0E8] rounded-tl-sm border border-[#2A2A2A]"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-[#1E1E1E] bg-[#111111] shrink-0">
                  <div className="flex items-end gap-2 bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-1 focus-within:border-[#C9A84C]/50 transition-colors">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none placeholder:text-[#F5F0E8]/30 min-h-[40px]"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="w-10 h-10 rounded-lg bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#D4B86A] transition-colors flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
