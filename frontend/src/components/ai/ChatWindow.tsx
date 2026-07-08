import { useState, useRef, useEffect } from 'react';

import { Send, Sparkles, Mic, MicOff } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { callGemini } from '@/lib/geminiClient';
import { Input } from '@/components/ui/input';

interface ChatWindowProps {
  compact?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STATIC_ANSWERS: Record<string, string> = {
  "What is PM-KISAN?":
    "PM-KISAN gives ₹6,000/year directly to farmer families in 3 instalments. Apply at your nearest Common Service Centre with Aadhaar and land records.",
  "Best crops for Kharif season?":
    "For Karnataka Kharif: Cotton, Ragi, Maize, Soybean, and Groundnut. Cotton suits Black Cotton soil districts like Bagalkot and Bidar.",
  "How to improve soil health?":
    "Apply organic matter (compost/FYM) before sowing. Test soil pH — 6.5 to 7.5 is ideal. Use Urea for nitrogen, DAP for phosphorus at planting.",
  "Cotton price today?":
    "Check the Market Prices page for live APMC rates. Current MSP for cotton is ₹6,620/quintal as set by the Government of India.",
};

export function ChatWindow({ _compact = false }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Namaste! I am KrishiMitra, your farming assistant. How can I help you today?',
    },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: query,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    resetTranscript();
    setSending(true);

    try {
      const staticReply = STATIC_ANSWERS[query];
      let replyText = '';

      if (staticReply) {
        replyText = staticReply;
      } else {
        const historyContext = messages.map(m => ({
          role: m.role,
          content: m.content,
        }));
        replyText = await callGemini(query, undefined, historyContext);
      }

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: replyText,
        },
      ]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: error.message || 'I am having trouble responding right now. Please try again.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a14] text-[#f0ece0]">
      {/* Scrollable Message List */}
      <div 
        ref={listRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-[13px]"
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed shadow-sm ${
              m.role === 'user'
                ? 'bg-[#c49a2a] text-[#0f0f0b] rounded-tr-none font-medium'
                : 'bg-neutral-900 border border-neutral-800 text-[#e2dcd0] rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2 flex items-center gap-1.5 text-neutral-400">
              <Sparkles size={13} className="text-[#c49a2a] animate-pulse" />
              <span className="text-[11px]">Thinking</span>
              <span className="flex gap-0.5 ml-1">
                {[0, 1, 2].map((i) => (
                  <span 
                    key={i} 
                    className="w-1.5 h-1.5 bg-[#c49a2a] rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 0.15}s` }} 
                  />
                ))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions Section */}
      {messages.length === 1 && !sending && (
        <div className="px-4 pb-3 space-y-2">
          <p className="text-[9px] text-[#6a6050] uppercase tracking-wider font-bold">Suggested Questions</p>
          <div className="flex flex-col gap-1">
            {Object.keys(STATIC_ANSWERS).map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-[11px] text-left bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800/80 hover:border-gold-400/20 text-[#a09880] hover:text-[#f0ece0] px-3 py-2 rounded-xl transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.07)] bg-neutral-950/20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask KrishiMitra..."
            disabled={sending}
            className="flex-1 bg-neutral-900 border-neutral-800 text-[#f0ece0] placeholder-neutral-600 focus-visible:ring-[#c49a2a] h-9 text-xs rounded-xl"
          />
          
          {browserSupportsSpeechRecognition && (
            <button
              onClick={toggleListening}
              disabled={sending}
              className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center ${
                listening 
                  ? 'bg-red-950/40 border-red-800 text-red-400' 
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-[#f0ece0]'
              }`}
            >
              {listening ? <MicOff size={14} className="animate-pulse" /> : <Mic size={14} />}
            </button>
          )}

          <button
            onClick={() => handleSend()}
            disabled={sending || !input.trim()}
            className="bg-[#c49a2a] hover:bg-[#d4aa3a] text-[#0f0f0b] font-bold rounded-xl px-3.5 h-9 text-xs flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-[#c49a2a]"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
