import { useState, useEffect } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export const KrishiMitraFloat = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-krishimitra', handleOpen);
    return () => window.removeEventListener('open-krishimitra', handleOpen);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 no-print">

      {/* Expanded chat panel */}
      {isOpen && (
        <div className="
          w-[380px] h-[520px] 
          bg-[#1a1a14] border border-[rgba(196,154,42,0.25)] 
          rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(196,154,42,0.15)]
          flex flex-col overflow-hidden
          animate-in slide-in-from-bottom-4 fade-in duration-200
        ">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.07)] bg-neutral-950/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[rgba(196,154,42,0.15)] flex items-center justify-center">
                <Sparkles size={14} className="text-[#c49a2a]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#f0ece0]">KrishiMitra</p>
                <p className="text-[10px] text-[#6a6050] font-medium">AI Farming Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
              <X size={14} className="text-[#a09880]" />
            </button>
          </div>

          {/* Chat window */}
          <div className="flex-1 overflow-hidden">
            <ChatWindow compact />
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          relative w-14 h-14 rounded-full 
          bg-[#c49a2a] hover:bg-[#d4aa3a]
          shadow-[0_4px_20px_rgba(196,154,42,0.4)]
          flex items-center justify-center
          transition-all duration-200 hover:scale-105 active:scale-95
        "
        aria-label="Open KrishiMitra AI assistant">
        {isOpen
          ? <X size={22} className="text-[#0f0f0b]" />
          : <MessageCircle size={22} className="text-[#0f0f0b]" />
        }
        {/* Pulse ring — only when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#c49a2a] animate-ping opacity-20" />
        )}
      </button>

    </div>
  );
};
