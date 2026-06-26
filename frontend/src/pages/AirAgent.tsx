import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ScrollReveal, FadeIn } from '@/components/ui/animations';
import { airAgent, ChatMessage } from '@/lib/ai/airAgent';
import { Mic, Send, Sparkles, MicOff } from 'lucide-react';

type LocalChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isTyping?: boolean;
};

function TypingMessage({ content }: { content: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, content]);

  return (
    <span>
      {displayedText}
      {currentIndex < content.length && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-leaf-600 ml-0.5"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  );
}

function AIThinking() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg px-4 py-3 bg-slate-50 shadow-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Sparkles className="h-4 w-4 text-leaf-600 animate-pulse" />
          <span className="text-sm">AI is thinking</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 bg-leaf-600 rounded-full"
                animate={{ y: [-3, 0, -3] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function generateId(): string {
  return Math.random().toString(36).slice(2);
}

export default function AirAgent() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<LocalChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem('airagent_chat_messages');
      return raw ? (JSON.parse(raw) as LocalChatMessage[]) : [];
    } catch {
      return [];
    }
  });
  const listRef = useRef<HTMLDivElement | null>(null);

  // Speech recognition
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    localStorage.setItem('airagent_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setSending(true);
    const userMsg: LocalChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    resetTranscript();

    try {
      const history: ChatMessage[] = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const answer = await airAgent.sendMessage(history, 'Karnataka');
      const assistantMsg: LocalChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: answer,
        createdAt: new Date().toISOString(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, isTyping: false } : m
          )
        );
      }, 0);
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Chat error',
        description: err.message ?? 'Failed to send message',
        variant: 'destructive',
      });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-4">
        <ScrollReveal>
          <div>
            <h1 className="text-gradient">AI Agent</h1>
            <p className="text-gray-600 mt-2">Your AI-powered agricultural assistant for Karnataka farmers</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <Card className="shadow-soft-lg card-hover">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-leaf-600 animate-pulse-soft" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
            <div
              ref={listRef}
              className="h-[55vh] overflow-y-auto space-y-3 p-4 bg-gradient-to-b from-white to-slate-50"
            >
              {messages.length === 0 ? (
                <FadeIn>
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Sparkles className="h-12 w-12 text-leaf-600 mb-4 opacity-50 animate-pulse-soft" />
                    <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
                    <p className="text-xs text-gray-400 mt-2">Ask about crops, weather, or farming advice</p>
                  </div>
                </FadeIn>
              ) : (
                <AnimatePresence>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                    >
                      {m.role === 'user' ? (
                        <div className="max-w-[80%] rounded-lg rounded-tr-sm px-4 py-2.5 bg-gradient-to-br from-leaf-600 to-leaf-700 text-white shadow-md card-interactive">
                          <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        </div>
                      ) : (
                        <div className="max-w-[80%] rounded-lg rounded-tl-sm px-4 py-3 bg-slate-50 shadow-sm border border-slate-100 card-hover">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">
                            {m.isTyping ? <TypingMessage content={m.content} /> : m.content}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {sending && <AIThinking />}
                </AnimatePresence>
              )}
            </div>

            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about crops, weather, or farming advice..."
                  disabled={sending}
                  className="flex-1 input-field"
                />
                {browserSupportsSpeechRecognition && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleListening}
                    disabled={sending}
                    className={`transition-all duration-200 ${listening ? 'bg-red-50 border-red-200 text-red-600' : 'hover:bg-leaf-50'}`}
                  >
                    {listening ? (
                      <MicOff className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="btn-primary min-w-[100px] card-interactive"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
              {listening && (
                <FadeIn>
                  <div className="mt-2 text-center">
                    <p className="text-xs text-red-600 flex items-center justify-center gap-1">
                      <Mic className="h-3 w-3 animate-pulse" />
                      Listening... Speak now or click mic to stop
                    </p>
                  </div>
                </FadeIn>
              )}
            </div>
          </CardContent>
        </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}


