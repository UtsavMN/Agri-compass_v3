import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, X, Sprout, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/httpClient";

export const VoiceChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([
    { text: "ನಮಸ್ಕಾರ! ರೈತ ಮಿತ್ರ, ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || isLoading) return;
    setMessages((prev) => [...prev, { text: userText, sender: "user" }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await apiPost('/api/ai/chat', { message: userText });
      const botReply = res?.reply || res?.response || "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಧನ್ಯವಾದಗಳು. ಇನ್ನಷ್ಟು ವಿವರಗಳನ್ನು ತಿಳಿಸಿ.";
      setMessages((prev) => [
        ...prev,
        { text: botReply, sender: "bot" }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "ಕ್ಷಮಿಸಿ, AI ಸಂಪರ್ಕ ಸಾಧಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.", sender: "bot" }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#C9A84C] rounded-full shadow-[0_0_20px_rgba(201,168,76,0.3)] flex items-center justify-center hover:scale-105 transition-transform z-50"
      >
        <Sprout className="w-7 h-7 text-[#0A0A0A]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-[#111] border border-[#1E1E1E] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1E1E1E] px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <h3 className="text-[#F5F0E8] font-semibold">Agri Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#F5F0E8]/50 hover:text-[#F5F0E8]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender === "user"
                        ? "bg-[#C9A84C] text-[#0A0A0A] rounded-br-none"
                        : "bg-[#1E1E1E] text-[#F5F0E8] rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1E1E1E] text-[#F5F0E8]/70 px-4 py-2.5 rounded-2xl text-sm flex items-center gap-2 rounded-bl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#111] border-t border-[#1E1E1E]">
              <div className="flex items-center gap-2 bg-[#1E1E1E] rounded-full p-1.5 pr-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask in Kannada or English..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-[#F5F0E8] px-3 text-sm focus:outline-none placeholder:text-[#F5F0E8]/30 disabled:opacity-50"
                />
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 rounded-full transition-colors ${
                    isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-[#111] text-[#C9A84C]"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-[#C9A84C] text-[#0A0A0A] rounded-full hover:bg-[#D4B86A] transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
