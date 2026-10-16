import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTourStore } from '@/store/tourStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  CloudSun, 
  TrendingUp, 
  Sprout, 
  Users, 
  Landmark, 
  Mic, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles,
  MapPin,
  ShieldCheck
} from 'lucide-react';

interface TourSlide {
  id: string;
  icon: React.ElementType;
  badgeEn: string;
  badgeKn: string;
  titleEn: string;
  titleKn: string;
  descEn: string;
  descKn: string;
  featuresEn: string[];
  featuresKn: string[];
  tag: string;
}

const TOUR_SLIDES: TourSlide[] = [
  {
    id: 'weather',
    icon: CloudSun,
    badgeEn: 'Hyper-Local Weather',
    badgeKn: 'ನಿಖರ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
    titleEn: 'GPS Farm Weather & Microclimate Alerts',
    titleKn: 'ಜಿಪಿಎಸ್ ಆಧಾರಿತ ಹವಾಮಾನ ಮತ್ತು ರೋಗ ಮುನ್ಸೂಚನೆ',
    descEn: 'Access 3-day high-precision weather forecasts customized directly to your exact farm coordinates or taluk. Receive vital pathogen infection advisories, rainfall intensity, and humidity trends.',
    descKn: 'ನಿಮ್ಮ ಜಮೀನಿನ ನಿಖರವಾದ ಸ್ಥಳಕ್ಕೆ ತಕ್ಕಂತೆ 3 ದಿನಗಳ ಮುನ್ಸೂಚನೆ, ಮಳೆಯ ಪ್ರಮಾಣ ಮತ್ತು ಬೆಳೆಗಳಿಗೆ ತಗುಲಬಹುದಾದ ರೋಗಗಳ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳನ್ನು ನೇರವಾಗಿ ಪಡೆಯಿರಿ.',
    featuresEn: [
      'Pinpoint GPS-accurate microclimate data',
      'Pathogen & fungal blight infection alerts',
      'Rainfall accumulation, wind & humidity metrics'
    ],
    featuresKn: [
      'ನಿಖರ ಜಿಪಿಎಸ್ ಆಧಾರಿತ ಸ್ಥಳೀಯ ಹವಾಮಾನ',
      'ಶಿಲೀಂಧ್ರ ಮತ್ತು ಕೀಟ ಬಾಧೆಯ ಎಚ್ಚರಿಕೆಗಳು',
      'ಮಳೆ ಪ್ರಮಾಣ, ಗಾಳಿಯ ವೇಗ ಮತ್ತು ತೇವಾಂಶ ಮಾಹಿತಿ'
    ],
    tag: 'Weather'
  },
  {
    id: 'market',
    icon: TrendingUp,
    badgeEn: 'Live APMC Mandis',
    badgeKn: 'ಲೈವ್ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ದರಗಳು',
    titleEn: 'Real-Time Mandi Market Intelligence',
    titleKn: 'ಕರ್ನಾಟಕದ ನೇರ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
    descEn: 'Compare live commodity prices across all 31 districts of Karnataka. Inspect minimum, maximum, and modal prices before selling crops like Paddy, Arecanut, Maize, Coffee, Tomato, and more.',
    descKn: 'ಕರ್ನಾಟಕದ ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳ ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ಭತ್ತ, ಅಡಿಕೆ, ಮೆಕ್ಕೆಜೋಳ, ಕಾಫಿ, ಟೊಮೇಟೊ ಮೊದಲಾದ ಬೆಳೆಗಳ ಇಂದಿನ ದರಗಳನ್ನು ಮಾರಾಟ ಮಾಡುವ ಮುನ್ನವೇ ಪರಿಶೀಲಿಸಿ.',
    featuresEn: [
      'Official Karnataka APMC mandi daily rates',
      'Modal, minimum & maximum price comparisons',
      'District-wise commodity filtering & trends'
    ],
    featuresKn: [
      'ಸರ್ಕಾರಿ ಎಪಿಎಂಸಿ ಮಂಡಿಗಳ ದೈನಂದಿನ ನೈಜ ದರಗಳು',
      'ಕನಿಷ್ಠ, ಗರಿಷ್ಠ ಮತ್ತು ಮಾದರಿ ದರಗಳ ಹೋಲಿಕೆ',
      'ಜಿಲ್ಲಾವಾರು ಬೆಳೆಗಳ ಬೆಲೆ ವಿಶ್ಲೇಷಣೆ'
    ],
    tag: 'Market Prices'
  },
  {
    id: 'farm',
    icon: Sprout,
    badgeEn: 'Soil & Farm Tech',
    badgeKn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ & ಜಮೀನು ನಿರ್ವಹಣೆ',
    titleEn: 'My Farm & Soil Diagnostic Intelligence',
    titleKn: 'ನನ್ನ ಜಮೀನು ಮತ್ತು ರಸಗೊಬ್ಬರ ಬುದ್ಧಿವಂತಿಕೆ',
    descEn: 'Register multiple farm parcels, monitor your total acreage holding, record laboratory NPK soil test analyses, and receive automated AI fertilizer dosage recommendations to maximize yields.',
    descKn: 'ನಿಮ್ಮ ಎಲ್ಲಾ ಜಮೀನುಗಳನ್ನು ನೋಂದಾಯಿಸಿ, ಒಟ್ಟು ವಿಸ್ತೀರ್ಣವನ್ನು ಪರಿಶೀಲಿಸಿ, ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ವರದಿಯನ್ನು ದಾಖಲಿಸಿ ಬೆಳೆಗಳಿಗೆ ಅಗತ್ಯವಿರುವ ನಿಖರ ರಸಗೊಬ್ಬರ ಶಿಫಾರಸು ಪಡೆಯಿರಿ.',
    featuresEn: [
      'Multi-farm management with verified acreage tracking',
      'Soil health NPK diagnostic records & history',
      'Customized fertilizer amendment dosage calculator'
    ],
    featuresKn: [
      'ಹಲವು ಜಮೀನುಗಳ ನೋಂದಣಿ ಮತ್ತು ಒಟ್ಟು ಎಕರೆ ಲೆಕ್ಕಾಚಾರ',
      'ಮಣ್ಣಿನ ಎನ್.ಪಿ.ಕೆ ಪರೀಕ್ಷಾ ವಿವರಗಳ ನಿರ್ವಹಣೆ',
      'ವೈಜ್ಞಾನಿಕ ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣದ ಶಿಫಾರಸುಗಳು'
    ],
    tag: 'My Farm'
  },
  {
    id: 'community',
    icon: Users,
    badgeEn: 'Farmer Community',
    badgeKn: 'ರೈತರ ಜಾಲತಾಣ',
    titleEn: 'Vibrant Karnataka Farmer Network',
    titleKn: 'ಕರ್ನಾಟಕದ ರೈತರ ಸಮುದಾಯ ಜಾಲತಾಣ',
    descEn: 'Connect with fellow agriculturists across Karnataka. Post field photos, ask questions regarding crop health, share harvesting experiences, and get peer advice from successful growers.',
    descKn: 'ರಾಜ್ಯದ ಇತರ ರೈತರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ. ಬೆಳೆ ರೋಗಗಳ ಫೋಟೋ ಹಂಚಿಕೊಂಡು ಪ್ರಶ್ನೆ ಕೇಳಿ, ಕೃಷಿ ಅನುಭವಗಳು ಹಾಗೂ ಸಲಹೆಗಳನ್ನು ವಿನಿಮಯ ಮಾಡಿಕೊಳ್ಳಿ.',
    featuresEn: [
      'Interactive crop photo & query sharing',
      'Likes, comments, and community discussions',
      'Localized agricultural expertise from fellow farmers'
    ],
    featuresKn: [
      'ಬೆಳೆಗಳ ಫೋಟೋಗಳೊಂದಿಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ',
      'ಲೈಕ್, ಕಾಮೆಂಟ್ ಮೂಲಕ ರೈತರೊಂದಿಗೆ ಸಂವಾದ',
      'ಅನುಭವಿ ರೈತರಿಂದ ಪ್ರಾಯೋಗಿಕ ಪರಿಹಾರಗಳು'
    ],
    tag: 'Community'
  },
  {
    id: 'schemes',
    icon: Landmark,
    badgeEn: 'Government Subsidies',
    badgeKn: 'ಸರ್ಕಾರಿ ಸೌಲಭ್ಯಗಳು',
    titleEn: 'State & Central Agricultural Schemes',
    titleKn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಹಾಯಧನ ಮಾರ್ಗದರ್ಶಿ',
    descEn: 'Discover active government subsidies including Ganga Kalyana, PM-KISAN, Krishi Bhagya, and Raitha Siri. Check your eligibility instantly with step-by-step application guidance.',
    descKn: 'ಗಂಗಾ ಕಲ್ಯಾಣ, ಪಿಎಂ-ಕಿಸಾನ್, ಕೃಷಿ ಭಾಗ್ಯ, ರೈತ ಸಿರಿ ಮುಂತಾದ ಯೋಜನೆಗಳ ಮಾಹಿತಿ ಪಡೆದು, ನಿಮ್ಮ ಅರ್ಹತೆಯನ್ನು ತಕ್ಷಣವೇ ಪರೀಕ್ಷಿಸಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
    featuresEn: [
      'Karnataka State & Central government schemes catalog',
      'Instant eligibility checker based on landholding & criteria',
      'Official application portals and document checklists'
    ],
    featuresKn: [
      'ರಾಜ್ಯ ಮತ್ತು ಕೇಂದ್ರ ಸರ್ಕಾರದ ಪ್ರಮುಖ ಯೋಜನೆಗಳ ಪಟ್ಟಿ',
      'ಜಮೀನಿನ ಆಧಾರದ ಮೇಲೆ ತ್ವರಿತ ಅರ್ಹತಾ ತಪಾಸಣೆ',
      'ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಅಗತ್ಯ ದಾಖಲೆಗಳ ವಿವರ'
    ],
    tag: 'Gov Schemes'
  },
  {
    id: 'voice',
    icon: Mic,
    badgeEn: 'KrishiMitra Voice AI',
    badgeKn: 'ಕೃಷಿಮಿತ್ರ ಧ್ವನಿ ಸಹಾಯಕ',
    titleEn: 'Hands-Free Bilingual Voice Companion',
    titleKn: 'ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಧ್ವನಿ ಸಹಾಯಕ',
    descEn: 'Working hands-on in the field? Tap the microphone icon anytime to ask crop, weather, or mandi questions in natural Kannada or English. Receive instant spoken and visual guidance.',
    descKn: 'ಹೊಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡುವಾಗ ಟೈಪ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ! ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ಕನ್ನಡದಲ್ಲೇ ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ ದರ ಅಥವಾ ಬೆಳೆಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ ತಕ್ಷಣ ಉತ್ತರ ಪಡೆಯಿರಿ.',
    featuresEn: [
      'Fluent speech recognition in Kannada & English',
      'Hands-free voice navigation across the application',
      'Always accessible via top navigation or floating assistant'
    ],
    featuresKn: [
      'ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಸುಲಭ ಧ್ವನಿ ಸಂಭಾಷಣೆ',
      'ಧ್ವನಿಯ ಮೂಲಕವೇ ಯಾವುದೇ ಪುಟಕ್ಕೆ ಸುಲಭ ಪ್ರವೇಶ',
      'ಮೇಲಿನ ಮೈಕ್ರೊಫೋನ್ ಬಟನ್‌ನಿಂದ ಯಾವಾಗಲೂ ಲಭ್ಯ'
    ],
    tag: 'KrishiMitra AI'
  }
];

export function FeatureTourModal() {
  const { isTourOpen, currentStep, totalSteps, closeTour, skipTour, nextStep, prevStep, goToStep } = useTourStore();
  const { language } = useLanguage();

  const isKn = language === 'kn';
  const slide = TOUR_SLIDES[currentStep] || TOUR_SLIDES[0];
  const IconComponent = slide.icon;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTourOpen) return;
      if (e.key === 'Escape') skipTour();
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourOpen, nextStep, prevStep, skipTour]);

  if (!isTourOpen) return null;

  const isLast = currentStep === totalSteps - 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={skipTour}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl bg-[#111111] border border-[#C9A84C]/30 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E] bg-[#161616]/90">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-bold">
                {currentStep + 1}
              </span>
              <span className="text-xs font-semibold tracking-wider text-[#F5F0E8]/50 uppercase">
                {isKn ? `ವೈಶಿಷ್ಟ್ಯ ${currentStep + 1} / ${totalSteps}` : `Feature ${currentStep + 1} of ${totalSteps}`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={skipTour}
                className="text-xs text-[#F5F0E8]/50 hover:text-[#C9A84C] font-medium transition-colors px-2 py-1 rounded"
              >
                {isKn ? 'ಸ್ಕಿಪ್ ಮಾಡಿ (Skip)' : 'Skip Tour'}
              </button>
              <button
                onClick={skipTour}
                className="p-1.5 rounded-full text-[#F5F0E8]/50 hover:text-[#F5F0E8] hover:bg-[#222] transition-colors"
                aria-label="Close tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slide Content Area */}
          <div className="p-6 sm:p-8 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
                className="space-y-6"
              >
                {/* Feature Badge + Icon */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 border border-[#C9A84C]/40 flex items-center justify-center shadow-lg shadow-[#C9A84C]/10 flex-shrink-0">
                    <IconComponent className="w-7 h-7 text-[#C9A84C]" />
                  </div>
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#C9A84C] bg-[#C9A84C]/10 px-2.5 py-0.5 rounded-full border border-[#C9A84C]/30 mb-1">
                      {isKn ? slide.badgeKn : slide.badgeEn}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F0E8] leading-tight">
                      {isKn ? slide.titleKn : slide.titleEn}
                    </h2>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-[#F5F0E8]/80 leading-relaxed">
                  {isKn ? slide.descKn : slide.descEn}
                </p>

                {/* Key Bullet Highlights */}
                <div className="bg-[#181818] border border-[#262626] rounded-2xl p-4 sm:p-5 space-y-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#C9A84C] flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isKn ? 'ಪ್ರಮುಖ ಸೌಲಭ್ಯಗಳು' : 'Key Capabilities'}
                  </p>
                  {(isKn ? slide.featuresKn : slide.featuresEn).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#F5F0E8]/90">
                      <ShieldCheck className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="px-6 sm:px-8 py-5 border-t border-[#1E1E1E] bg-[#141414] flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Step Pagination Dots */}
            <div className="flex items-center gap-2">
              {TOUR_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => goToStep(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'w-7 bg-[#C9A84C]'
                      : 'w-2 bg-[#2E2E2E] hover:bg-[#444]'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="border-[#2E2E2E] text-[#F5F0E8]/70 hover:text-[#F5F0E8] hover:bg-[#1E1E1E] disabled:opacity-30 disabled:pointer-events-none rounded-xl px-4 py-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {isKn ? 'ಹಿಂದಿನದು' : 'Previous'}
              </Button>

              <Button
                onClick={nextStep}
                className="bg-[#C9A84C] hover:bg-[#D4B86A] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider rounded-xl px-5 py-2 shadow-lg shadow-[#C9A84C]/20 transition-all flex items-center gap-1.5"
              >
                {isLast ? (
                  <>
                    <Check className="w-4 h-4" />
                    {isKn ? 'ಆರಂಭಿಸಿ (Get Started)' : 'Get Started'}
                  </>
                ) : (
                  <>
                    {isKn ? 'ಮುಂದಿನದು' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
