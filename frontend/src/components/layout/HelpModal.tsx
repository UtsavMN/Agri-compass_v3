import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages, Send, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { language, toggleLanguage } = useLanguage();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [subject, setSubject] = useState('');
  
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    // Simulate sending feedback
    toast({
      title: "Feedback Sent",
      description: "Thank you for helping us improve Agri-Compass!",
    });
    setFeedback('');
    setSubject('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-[#12120e] border-earth-border/40 text-gold-100/90 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center pr-4">
            <DialogTitle className="text-xl font-bold text-[#f0ece0]">Help & Support</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="h-8 px-3 rounded-full border border-gold-400/30 text-gold-400 hover:bg-gold-400/10 hover:text-gold-300 flex items-center gap-1.5 transition-colors"
            >
              <Languages className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase">{language === 'en' ? 'EN (ಕನ್ನಡ)' : 'KN (English)'}</span>
            </Button>
          </div>
          <DialogDescription className="text-sm text-gold-100/60 pt-2">
            Find answers to common questions or send us feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-8">
          {/* Direct Support Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="tel:18001801551" className="flex items-center p-4 rounded-xl bg-earth-card border border-earth-border/40 hover:border-gold-400/50 transition-colors group">
              <div className="h-10 w-10 rounded-full bg-gold-400/10 flex items-center justify-center mr-4 group-hover:bg-gold-400/20">
                <Smartphone className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Kisan Call Center</p>
                <p className="text-lg font-black text-[#f0ece0]">1800-180-1551</p>
              </div>
            </a>
            
            <a href="https://wa.me/911234567890" target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-xl bg-earth-card border border-earth-border/40 hover:border-green-400/50 transition-colors group">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-4 group-hover:bg-green-500/20">
                <Send className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-green-400 uppercase tracking-wider">WhatsApp Support</p>
                <p className="text-sm font-medium text-[#f0ece0]">Chat with KrishiMitra</p>
              </div>
            </a>
          </section>

          {/* Interactive Tour Section */}
          <section className="bg-gradient-to-r from-gold-400/10 to-transparent p-4 rounded-xl border border-gold-400/20 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#f0ece0]">Need a refresher?</p>
              <p className="text-xs text-gold-100/60">Take an interactive tour of the dashboard.</p>
            </div>
            <Button variant="outline" size="sm" className="border-gold-400/30 text-gold-400 hover:bg-gold-400/10" onClick={() => {
              toast({ title: "Tour Starting", description: "Interactive tour initialized..." });
              onClose();
            }}>
              Restart Tour
            </Button>
          </section>

          {/* FAQ Section */}
          <section>
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-4 border-b border-earth-border/40 pb-2">
              Frequently Asked Questions (Video Guides)
            </h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-earth-border/40">
                <AccordionTrigger className="text-sm text-[#f0ece0] hover:text-gold-200">How do I use Voice Commands?</AccordionTrigger>
                <AccordionContent className="text-xs text-gold-100/70">
                  Click the microphone icon in the top navigation bar. When the modal opens, click the recording button and speak clearly. You can ask for crop prices, weather, or navigate to pages.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-earth-border/40">
                <AccordionTrigger className="text-sm text-[#f0ece0] hover:text-gold-200">Where can I find live Mandi prices?</AccordionTrigger>
                <AccordionContent className="text-xs text-gold-100/70">
                  Navigate to the "Market Prices" section via the main menu. You can view trends and current prices based on your selected district.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-earth-border/40">
                <AccordionTrigger className="text-sm text-[#f0ece0] hover:text-gold-200">How do I update my farm location?</AccordionTrigger>
                <AccordionContent className="text-xs text-gold-100/70">
                  Go to your "Profile" via the avatar menu in the top right, and you can update your primary district there to get localized weather and market data.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-earth-border/40">
                <AccordionTrigger className="text-sm text-[#f0ece0] hover:text-gold-200">How does the translate feature work?</AccordionTrigger>
                <AccordionContent className="text-xs text-gold-100/70">
                  Clicking the Language toggle will translate the entire application between English and Kannada using Google Translate. Some dynamic content might take a moment to reflect the change.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border-earth-border/40">
                <AccordionTrigger className="text-sm text-[#f0ece0] hover:text-gold-200">How do I sell my crops on Agri-Compass?</AccordionTrigger>
                <AccordionContent className="text-xs text-gold-100/70">
                  You can use the 'Community' section. We are also rolling out a dedicated 'Buy & Sell' feature soon to help you connect directly with buyers!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6" className="border-earth-border/40">
                <AccordionTrigger className="text-sm text-[#f0ece0] hover:text-gold-200">What is Fertilizer Intelligence?</AccordionTrigger>
                <AccordionContent className="text-xs text-gold-100/70">
                  Fertilizer Intelligence is an AI-powered tool available in the 'My Farm' section. It analyzes your crop and soil data to recommend the exact amount of fertilizer needed.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7" className="border-earth-border/40">
                <AccordionTrigger className="text-sm text-[#f0ece0] hover:text-gold-200">How do I check government scheme eligibility?</AccordionTrigger>
                <AccordionContent className="text-xs text-gold-100/70">
                  Head over to the 'Gov Schemes' tab from the top navigation bar. You can view all active schemes and use the eligibility checker to see what you qualify for.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Feedback Section */}
          <section>
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-4 border-b border-earth-border/40 pb-2">
              Send Feedback
            </h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#1a1a14]/60 border border-earth-border/40 rounded-lg p-3 text-sm text-[#f0ece0] placeholder:text-gold-100/30 focus:outline-none focus:border-gold-400/50"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="How can we improve Agri-Compass?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full bg-[#1a1a14]/60 border border-earth-border/40 rounded-lg p-3 text-sm text-[#f0ece0] placeholder:text-gold-100/30 focus:outline-none focus:border-gold-400/50 resize-none"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gold-400 hover:bg-gold-500 text-[#0A0A0A] font-bold text-xs uppercase tracking-widest">
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </form>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
