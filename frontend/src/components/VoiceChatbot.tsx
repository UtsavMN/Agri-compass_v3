import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, X, Send, Sprout } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Note: You must add VITE_GROQ_API_KEY to your .env file
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

export const VoiceChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [response, setResponse] = useState("ಹಲೋ! ನಾನು ಕೃಷಿ ಸಹಾಯಕಿ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"); // "Hello! I am Agri Assistant. How can I help you?"
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the chatbot entirely on the messages pages to prevent overlapping the chat input
  const isMessagesPage = location.pathname.startsWith('/messages');

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "kn-IN"; // Kannada language
      
      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleIntent(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "kn-IN";
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleIntent = async (text: string) => {
    setResponse("ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..."); // "Analyzing..."
    
    if (!GROQ_API_KEY) {
      const msg = "ಕ್ಷಮಿಸಿ, ಎಪಿಐ ಕೀ (API Key) ಇಲ್ಲ."; // Sorry, no API key
      setResponse(msg);
      speak(msg);
      return;
    }

    try {
      const completion = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: `You are a helpful agricultural assistant for farmers in Karnataka.
              The user will speak in Kannada or English. 
              Respond ONLY in Kannada script. Keep it under 2 sentences.
              If they ask about prices, suggest /market-prices.
              If they ask about weather, suggest /weather.
              If they ask about schemes, suggest /schemes.
              Format your response as: [Action]|Your Kannada response here
              Where Action is either a path (e.g. /weather) or "none".`
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.5,
          max_tokens: 150
        })
      });

      const data = await completion.json();
      const rawText = data.choices[0].message.content || "";
      
      const [action, reply] = rawText.includes("|") ? rawText.split("|") : ["none", rawText];
      
      setResponse(reply.trim());
      speak(reply.trim());

      if (action !== "none" && action.startsWith("/")) {
        setTimeout(() => {
          navigate(action.trim());
          setIsOpen(false);
        }, 2000);
      }

    } catch (error) {
      console.error(error);
      const msg = "ಕ್ಷಮಿಸಿ, ದೋಷ ಉಂಟಾಗಿದೆ."; // Sorry, an error occurred
      setResponse(msg);
      speak(msg);
    }
  };

  if (isMessagesPage) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#C9A84C] text-[#0A0A0A] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.4)] z-50 hover:bg-[#D4B86A] transition-all duration-300"
      >
        <Sprout className="w-6 h-6" />
      </motion.button>

      {/* Voice Chatbot Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 bg-[#0A0A0A]/95 backdrop-blur-2xl border border-[#1E1E1E] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-[#1E1E1E] bg-[#111111]/50">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-[#C9A84C]'}`} />
                <h3 className="text-[#F5F0E8] font-bold text-xs uppercase tracking-widest">Agri Voice Assistant</h3>
              </div>
              <button onClick={() => {
                setIsOpen(false);
                if (window.speechSynthesis) window.speechSynthesis.cancel();
              }} className="text-[#F5F0E8]/40 hover:text-[#F5F0E8] transition-colors p-1 hover:bg-[#1E1E1E] rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area - Chat Bubbles */}
            <div className="p-5 space-y-6 flex-1 min-h-[18rem] max-h-[24rem] overflow-y-auto custom-scrollbar">
              
              {/* User Bubble */}
              <AnimatePresence>
                {transcript && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className="flex justify-end"
                  >
                    <div className="bg-[#1E1E1E] text-[#F5F0E8] px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] text-sm shadow-md border border-[#2A2A2A]">
                      {transcript}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Bubble */}
              <motion.div 
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                key={response}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#111111] border border-[#1E1E1E] flex items-center justify-center flex-shrink-0 shadow-inner mt-1">
                  {isSpeaking ? (
                    <div className="flex items-end gap-0.5 h-3">
                      <motion.div animate={{ height: ["20%", "100%", "20%"] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-[#C9A84C] rounded-full" />
                      <motion.div animate={{ height: ["40%", "80%", "40%"] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-[#C9A84C] rounded-full" />
                      <motion.div animate={{ height: ["30%", "100%", "30%"] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-[#C9A84C] rounded-full" />
                    </div>
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#C9A84C]" />
                  )}
                </div>
                <div className="bg-[#111111] border border-[#C9A84C]/20 text-[#F5F0E8] px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] text-sm shadow-[0_2px_15px_rgba(201,168,76,0.05)] leading-relaxed font-medium">
                  {response}
                </div>
              </motion.div>
              
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0A0A0A] border-t border-[#1E1E1E]">
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  if (textInput.trim()) { 
                    handleIntent(textInput); 
                    setTranscript(textInput);
                    setTextInput(''); 
                  } 
                }} 
                className="flex items-center gap-2 bg-[#111111] border border-[#1E1E1E] rounded-xl p-1.5 focus-within:border-[#C9A84C]/50 transition-colors shadow-inner"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Ask anything..."}
                  className="flex-1 min-w-0 bg-transparent px-3 py-1.5 text-sm text-[#F5F0E8] focus:outline-none placeholder:text-[#F5F0E8]/30 font-medium"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                    isListening 
                      ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/50' 
                      : 'bg-[#1E1E1E] text-[#C9A84C] hover:bg-[#2A2A2A]'
                  }`}
                  title="Speak"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="p-2 bg-[#C9A84C] text-[#0A0A0A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#D4B86A] transition-colors flex-shrink-0 shadow-sm"
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
