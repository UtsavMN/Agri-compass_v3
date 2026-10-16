import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages, Send, Smartphone, PhoneCall, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTourStore } from '@/store/tourStore';
import { useUser } from '@/store';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEVELOPER_HELPLINES = [
  { phone: '7022131508', display: '+91 70221 31508', role: 'Dev Team Support (Lead)' },
  { phone: '8431742216', display: '+91 84317 42216', role: 'Dev Team Support' },
  { phone: '9481306283', display: '+91 94813 06283', role: 'Dev Team Support' },
  { phone: '7892653439', display: '+91 78926 53439', role: 'Dev Team Support' },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { language, toggleLanguage } = useLanguage();
  const { toast } = useToast();
  const { startTour } = useTourStore();
  const { profile } = useUser();

  // Pick or randomize developer line based on profile id or session
  const [devIndex, setDevIndex] = useState(() => {
    if (profile?.id) {
      let hash = 0;
      for (let i = 0; i < profile.id.length; i++) {
        hash = (hash << 5) - hash + profile.id.charCodeAt(i);
      }
      return Math.abs(hash) % DEVELOPER_HELPLINES.length;
    }
    return Math.floor(Math.random() * DEVELOPER_HELPLINES.length);
  });

  const activeDev = DEVELOPER_HELPLINES[devIndex];

  const handleNextDev = () => {
    const nextIdx = (devIndex + 1) % DEVELOPER_HELPLINES.length;
    setDevIndex(nextIdx);
    toast({
      title: "Contact Switched",
      description: `Connected to developer line: ${DEVELOPER_HELPLINES[nextIdx].display}`,
    });
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
            Find answers to common questions or connect directly with our technical team.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Direct Support Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                Direct Developer Contact & Support
              </h3>
              <button
                type="button"
                onClick={handleNextDev}
                className="text-[11px] text-gold-400 hover:text-gold-300 font-medium flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-gold-400/10"
                title="Switch to another developer line if busy"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Switch Developer Line</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Developer Direct Call */}
              <a
                href={`tel:+91${activeDev.phone}`}
                className="flex items-center p-3.5 rounded-xl bg-earth-card border border-earth-border/40 hover:border-gold-400/50 transition-colors group"
              >
                <div className="h-10 w-10 rounded-full bg-gold-400/10 flex items-center justify-center mr-3 group-hover:bg-gold-400/20 flex-shrink-0">
                  <PhoneCall className="w-5 h-5 text-gold-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gold-400 uppercase tracking-wider">
                    Developer Helpline
                  </p>
                  <p className="text-base font-black text-[#f0ece0] truncate">
                    {activeDev.display}
                  </p>
                </div>
              </a>

              {/* Developer WhatsApp Support */}
              <a
                href={`https://wa.me/91${activeDev.phone}?text=${encodeURIComponent("Hello AgriCompass Developer Team, I need assistance with the app.")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center p-3.5 rounded-xl bg-earth-card border border-earth-border/40 hover:border-green-400/50 transition-colors group"
              >
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3 group-hover:bg-green-500/20 flex-shrink-0">
                  <Send className="w-5 h-5 text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                    WhatsApp Developer
                  </p>
                  <p className="text-xs font-semibold text-[#f0ece0] truncate">
                    Chat with Team ({activeDev.phone.slice(-4)})
                  </p>
                </div>
              </a>
            </div>

            {/* Kisan Call Center */}
            <a
              href="tel:18001801551"
              className="flex items-center p-3 rounded-xl bg-[#141414] border border-earth-border/30 hover:border-gold-400/40 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gold-400/10 flex items-center justify-center mr-3 flex-shrink-0">
                <Smartphone className="w-4 h-4 text-gold-400" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gold-400/80 uppercase tracking-wider">
                    Kisan Call Center (Govt of India)
                  </p>
                  <p className="text-sm font-bold text-[#f0ece0]">1800-180-1551</p>
                </div>
                <span className="text-[10px] text-gold-100/40 font-medium">Toll-Free</span>
              </div>
            </a>
          </section>

          {/* Interactive Tour Section */}
          <section className="bg-gradient-to-r from-gold-400/10 to-transparent p-4 rounded-xl border border-gold-400/20 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#f0ece0]">Need a refresher?</p>
              <p className="text-xs text-gold-100/60">Take an interactive tour of the platform features.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gold-400/30 text-gold-400 hover:bg-gold-400/10"
              onClick={() => {
                onClose();
                startTour();
              }}
            >
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
                  Clicking the Language toggle will translate the entire application between English and Kannada. Some dynamic content might take a moment to reflect the change.
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
