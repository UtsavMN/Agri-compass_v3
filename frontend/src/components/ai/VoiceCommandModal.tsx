import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mic, MicOff, Volume2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { apiGet, apiPost } from '@/lib/httpClient';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandGuide {
  phrase: string;
  englishPhrase: string;
  action: string;
  route: string;
}

export const VoiceCommandModal = ({ isOpen, onClose }: VoiceCommandModalProps) => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [matchedCommand, setMatchedCommand] = useState<CommandGuide | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [lang, setLang] = useState<'kn-IN' | 'en-US'>('kn-IN');
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);
  const [userFarms, setUserFarms] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  // Suggested voice commands in Kannada and English
  const commandGuides: CommandGuide[] = [
    {
      phrase: 'ಬೆಳೆಗಳ ಪಟ್ಟಿ ತೋರಿಸು',
      englishPhrase: 'Show me the list of crops',
      action: 'Crops Page',
      route: '/crops',
    },
    {
      phrase: 'ಹವಾಮಾನ ವರದಿ ತೋರಿಸು',
      englishPhrase: 'Show weather report',
      action: 'Weather Details',
      route: '/weather',
    },
    {
      phrase: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
      englishPhrase: 'Market prices',
      action: 'Market Prices',
      route: '/market-prices',
    },
    {
      phrase: 'ನನ್ನ ಜಮೀನು',
      englishPhrase: 'My farm details',
      action: 'My Farm Page',
      route: '/my-farm',
    },
    {
      phrase: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
      englishPhrase: 'Government schemes',
      action: 'Gov Schemes',
      route: '/schemes',
    },
    {
      phrase: 'ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮಾಡು',
      englishPhrase: 'Soil analysis',
      action: 'Soil analysis',
      route: '/soil-analysis',
    },
    {
      phrase: 'ರೈತರ ಸಮುದಾಯ',
      englishPhrase: 'Farmers community',
      action: 'Community forum',
      route: '/community',
    },
    {
      phrase: 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗು',
      englishPhrase: 'Go to dashboard',
      action: 'Dashboard',
      route: '/dashboard',
    },
    {
      phrase: 'ಕೃಷಿ ಮಿತ್ರ ಸಹಾಯ',
      englishPhrase: 'Krishi Mitra AI Assistant',
      action: 'Open AI Assistant',
      route: 'krishimitra',
    },
  ];

  // Text to Speech in Kannada
  const speakFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any current speaking
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      // Try to find a matching voice locale
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      
      utterance.rate = 0.95; // Slightly slower for better clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  // Local fallback keyword matcher
  const runLocalFallback = (spokenText: string): CommandGuide | null => {
    const textLower = spokenText.toLowerCase().trim();
    
    const KANNADA_CROP_MAP: Record<string, string> = {
      'ರಾಗಿ': 'ragi',
      'ಭತ್ತ': 'rice',
      'ಅಕ್ಕಿ': 'rice',
      'ಗೋಧಿ': 'wheat',
      'ಮೆಕ್ಕೆಜೋಳ': 'maize',
      'ಜೋಳ': 'jowar',
      'ಕಬ್ಬು': 'sugarcane',
      'ಹತ್ತಿ': 'cotton',
      'ಶೇಂಗಾ': 'groundnut',
      'ಕಡಲೆಕಾಯಿ': 'groundnut',
      'ಬೆಳ್ಳುಳ್ಳಿ': 'garlic',
      'ಈರುಳ್ಳಿ': 'onion',
      'ಶುಂಠಿ': 'ginger',
      'ಕಾಫಿ': 'coffee',
      'ಟೊಮೆಟೊ': 'tomato',
      'ಆಲೂಗಡ್ಡೆ': 'potato',
      'ಬದನೆಕಾಯಿ': 'brinjal',
      'ಮೆಣಸಿನಕಾಯಿ': 'chilli',
      'ತೆಂಗಿನಕಾಯಿ': 'coconut'
    };

    // 1. Check for specific crop matches in Kannada crop map
    for (const [knName, enName] of Object.entries(KANNADA_CROP_MAP)) {
      if (textLower.includes(knName)) {
        const matchedCrop = availableCrops.find(c => c.toLowerCase().includes(enName));
        if (matchedCrop) {
          const slug = matchedCrop.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s/]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
          return {
            phrase: `${matchedCrop} ಬೆಳೆ ವಿವರ`,
            englishPhrase: `${matchedCrop} Crop Details`,
            action: `${matchedCrop} Details`,
            route: `/crop/${slug}`
          };
        }
      }
    }

    // 2. Check for specific crop matches in English availableCrops
    for (const crop of availableCrops) {
      const cropLower = crop.toLowerCase();
      // Split Ragi (Finger Millet) into ["ragi", "finger millet"]
      const parts = cropLower.split(/[()]/).map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        if (part.length > 2 && textLower.includes(part)) {
          const slug = crop.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s/]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
          return {
            phrase: `${crop} ಬೆಳೆ ವಿವರ`,
            englishPhrase: `${crop} Crop Details`,
            action: `${crop} Details`,
            route: `/crop/${slug}`
          };
        }
      }
    }

    // 3. Generic matches (e.g. general crops registry, weather, farm, etc.)
    if (
      textLower.includes('ಬೆಳೆ') || 
      textLower.includes('ಬೆಳೆಗಳು') || 
      textLower.includes('ಬೆಳೆಗಳ') ||
      textLower.includes('crop') ||
      textLower.includes('crops')
    ) {
      return commandGuides[0]; // Crops Page
    }
    if (
      textLower.includes('ಹವಾಮಾನ') || 
      textLower.includes('ಹವೆ') || 
      textLower.includes('ಮಳೆ') ||
      textLower.includes('weather') ||
      textLower.includes('rain') ||
      textLower.includes('forecast')
    ) {
      return commandGuides[1]; // Weather
    }
    if (
      textLower.includes('ಮಾರುಕಟ್ಟೆ') || 
      textLower.includes('ಬೆಲೆ') || 
      textLower.includes('ಧಾರಣೆ') ||
      textLower.includes('ದರ') ||
      textLower.includes('ರೇಟ್') ||
      textLower.includes('market') ||
      textLower.includes('price') ||
      textLower.includes('prices')
    ) {
      return commandGuides[2]; // Market Prices
    }
    if (
      textLower.includes('ಜಮೀನು') || 
      textLower.includes('ಹೊಲ') || 
      textLower.includes('ತೋಟ') ||
      textLower.includes('ಫಾರ್ಮ್') ||
      textLower.includes('farm') ||
      textLower.includes('land')
    ) {
      return commandGuides[3]; // My Farm
    }
    if (
      textLower.includes('ಯೋಜನೆ') || 
      textLower.includes('ಯೋಜನೆಗಳು') || 
      textLower.includes('ಸರ್ಕಾರ') ||
      textLower.includes('scheme') ||
      textLower.includes('schemes') ||
      textLower.includes('yojana')
    ) {
      return commandGuides[4]; // Gov Schemes
    }
    if (
      textLower.includes('ಮಣ್ಣು') || 
      textLower.includes('ಮಣ್ಣಿನ') || 
      textLower.includes('ಪರೀಕ್ಷೆ') ||
      textLower.includes('soil')
    ) {
      return commandGuides[5]; // Soil Analysis
    }
    if (
      textLower.includes('ಸಮುದಾಯ') || 
      textLower.includes('ಚರ್ಚೆ') || 
      textLower.includes('ಗೆಳೆಯರು') ||
      textLower.includes('ರೈತರು') ||
      textLower.includes('community') ||
      textLower.includes('forum')
    ) {
      return commandGuides[6]; // Community
    }
    if (
      textLower.includes('ಮುಖಪುಟ') || 
      textLower.includes('ಡ್ಯಾಶ್') || 
      textLower.includes('ಮುಖ್ಯ') ||
      textLower.includes('dashboard') ||
      textLower.includes('home')
    ) {
      return commandGuides[7]; // Dashboard
    }
    if (
      textLower.includes('ಮಿತ್ರ') || 
      textLower.includes('ಕೃಷಿಮಿತ್ರ') || 
      textLower.includes('ಕೃಷಿ ಮಿತ್ರ') || 
      textLower.includes('ಸಹಾಯ') ||
      textLower.includes('assistant') ||
      textLower.includes('krishi') ||
      textLower.includes('help')
    ) {
      return commandGuides[8]; // Krishi Mitra
    }
    if (
      textLower.includes('ಪ್ರೊಫೈಲ್') || 
      textLower.includes('ಖಾತೆ') || 
      textLower.includes('profile')
    ) {
      return {
        phrase: 'ಪ್ರೊಫೈಲ್',
        englishPhrase: 'Profile page',
        action: 'Profile Settings',
        route: '/profile'
      };
    }
    return null;
  };

  const cleanMarkdown = (text: string): string => {
    if (!text) return '';
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '').trim();
    }
    return cleaned;
  };

  // Process and match the spoken transcript
  const processTranscript = async (spokenText: string) => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsAnalyzing(true);
    let matched: CommandGuide | null = null;

    // Dynamically build system prompt with crop names and farm names from DB
    const dynamicSystemPrompt = `You are the voice command intent classifier for Agri Compass.
Analyze the user's spoken input (in Kannada or English) and classify it into one of these intents and target paths:
- Intent: 'CROPS', Path: '/crops'
- Intent: 'WEATHER', Path: '/weather'
- Intent: 'MARKET_PRICES', Path: '/market-prices'
- Intent: 'MY_FARM', Path: '/my-farm'
- Intent: 'GOV_SCHEMES', Path: '/schemes'
- Intent: 'SOIL_ANALYSIS', Path: '/soil-analysis'
- Intent: 'COMMUNITY', Path: '/community'
- Intent: 'DASHBOARD', Path: '/dashboard'
- Intent: 'PROFILE', Path: '/profile'
- Intent: 'ASSISTANT', Path: 'krishimitra'
- Intent: 'UNKNOWN', Path: ''

DATABASE CONTEXT:
- Available Crops: [ ${availableCrops.join(', ')} ]
- User's Farms: [ ${userFarms.join(', ')} ]

ADDITIONAL ROUTING RULES:
1. If the user mentions any crop in the "Available Crops" list (like "Rice" or "ರಾಗಿ"), set the Path to "/crop/CropName" where CropName is the matched crop name in English (Capitalized, e.g. "Rice", "Maize", "Ragi").
2. If they ask about a specific farm in the "User's Farms" list, route to "/my-farm".

Respond ONLY with a minified, valid JSON object matching this schema:
{"intent": "INTENT_NAME", "path": "TARGET_PATH", "reason": "Brief explanation in English"}
Do NOT wrap the response in markdown code blocks like \`\`\`. Output plain text JSON only.`;

    try {
      // 1. Send the speech transcript to Gemini classifier backend endpoint
      const response = await apiPost('/api/ai/chat', {
        prompt: spokenText,
        systemContext: dynamicSystemPrompt
      });

      if (response && response.success && response.response) {
        const cleanedJson = cleanMarkdown(response.response);
        try {
          const result = JSON.parse(cleanedJson);
          if (result && result.path) {
            // Find in commandGuides or create a dynamic one
            const targetPath = result.path;
            const existingGuide = commandGuides.find(g => g.route === targetPath);
            if (existingGuide) {
              matched = existingGuide;
            } else if (targetPath === '/profile') {
              matched = {
                phrase: 'ಪ್ರೊಫೈಲ್',
                englishPhrase: 'Profile page',
                action: 'Profile Settings',
                route: '/profile'
              };
            } else if (targetPath.startsWith('/crop/')) {
              let cropParam = targetPath.split('/').pop() || '';
              cropParam = decodeURIComponent(cropParam).toLowerCase().trim();
              
              // Find the matching crop dynamically from availableCrops list
              const matchedCrop = availableCrops.find(c => {
                const name = c.toLowerCase().trim();
                const slugName = c.toLowerCase().trim()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/[\s/]+/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-+|-+$/g, '');
                
                return name === cropParam || 
                       slugName === cropParam || 
                       name.includes(cropParam) || 
                       cropParam.includes(name);
              });

              const targetCrop = matchedCrop || cropParam;
              const slug = targetCrop.toLowerCase().trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s/]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');

              matched = {
                phrase: `${targetCrop} ಬೆಳೆ ವಿವರ`,
                englishPhrase: `${targetCrop} Crop Details`,
                action: `${targetCrop} Details`,
                route: `/crop/${slug}`
              };
            }
          }
        } catch (jsonErr) {
          console.warn('Failed to parse classifier JSON response, using fallback', jsonErr);
        }
      }
    } catch (apiErr) {
      console.warn('Classifier API call failed, using local fallback matching', apiErr);
    }

    // 2. Local fallback if AI classification failed or returned UNKNOWN
    if (!matched) {
      matched = runLocalFallback(spokenText);
    }

    setIsAnalyzing(false);

    if (matched) {
      setMatchedCommand(matched);
      
      // Audio confirmation in Kannada or English
      const feedbackText = lang === 'kn-IN'
        ? `${matched.phrase} ಪುಟಕ್ಕೆ ಹೋಗಲಾಗುತ್ತಿದೆ`
        : `Navigating to ${matched.action}`;
      
      speakFeedback(feedbackText);

      // Execute navigation after short delay to let user see match
      setTimeout(() => {
        onClose();
        if (matched?.route === 'krishimitra') {
          // Trigger the KrishiMitra float assistant event
          window.dispatchEvent(new CustomEvent('open-krishimitra'));
        } else if (matched?.route) {
          navigate(matched.route);
        }
        // Reset states
        setTranscript('');
        setMatchedCommand(null);
      }, 1500);
    } else {
      // Speak out warning if no match found
      const retryText = lang === 'kn-IN'
        ? "ಕ್ಷಮಿಸಿ, ಆಜ್ಞೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ."
        : "Sorry, command not recognized. Please try again.";
      speakFeedback(retryText);
    }
  };

  // Start Speech Recognition
  const startSpeech = () => {
    setErrorMsg('');
    setTranscript('');
    setMatchedCommand(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. / Your browser does not support Speech Recognition.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setTranscript(resultTranscript);

        if (event.results[current].isFinal) {
          processTranscript(resultTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್ ಪರಿಶೀಲಿಸಿ. / Microphone access denied. Please check your browser permissions.');
        } else {
          setErrorMsg(`ದೋಷ ಸಂಭವಿಸಿದೆ: ${event.error} / Error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setErrorMsg(`ದೋಷ: ${err.message || err}`);
      setIsListening(false);
    }
  };

  // Handle clicking a template card to test the navigation
  const triggerSampleCommand = (guide: CommandGuide) => {
    setTranscript(lang === 'kn-IN' ? guide.phrase : guide.englishPhrase);
    setMatchedCommand(guide);
    
    const feedbackText = lang === 'kn-IN'
      ? `${guide.phrase} ಪುಟಕ್ಕೆ ಹೋಗಲಾಗುತ್ತಿದೆ`
      : `Navigating to ${guide.action}`;
    speakFeedback(feedbackText);

    setTimeout(() => {
      onClose();
      if (guide.route === 'krishimitra') {
        window.dispatchEvent(new CustomEvent('open-krishimitra'));
      } else {
        navigate(guide.route);
      }
      setTranscript('');
      setMatchedCommand(null);
    }, 1500);
  };

  useEffect(() => {
    const fetchContextData = async () => {
      try {
        const cropsRes = await apiGet('/api/crops?size=50');
        if (cropsRes && cropsRes.content) {
          const names = cropsRes.content.map((c: any) => c.name).filter(Boolean);
          setAvailableCrops(names);
        }
      } catch (err) {
        console.warn('Failed to fetch crops context:', err);
      }

      try {
        const farmsRes = await apiGet('/api/farms');
        if (Array.isArray(farmsRes)) {
          const names = farmsRes.map((f: any) => f.name).filter(Boolean);
          setUserFarms(names);
        }
      } catch (err) {
        console.warn('Failed to fetch farms context:', err);
      }
    };

    if (isOpen) {
      fetchContextData();
      setTimeout(() => {
        startSpeech();
      }, 300);
    } else {
      // Clean up on close
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript('');
      setMatchedCommand(null);
      setErrorMsg('');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isOpen, lang]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
          {/* Modal Backdrop Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-[#1a1a14] border border-[rgba(196,154,42,0.25)] rounded-2xl shadow-premium overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.07)] bg-neutral-950/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[rgba(196,154,42,0.15)] flex items-center justify-center">
                  <Sparkles size={16} className="text-[#c49a2a]" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-widest text-[#f0ece0] uppercase">
                    {lang === 'kn-IN' ? 'ಧ್ವನಿ ಆಜ್ಞೆಗಳು' : 'Voice Navigation'}
                  </h3>
                  <p className="text-[10px] text-[#6a6050] uppercase font-bold tracking-wider">
                    {lang === 'kn-IN' ? 'ಮಾತನಾಡಿ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ' : 'Speak to navigate'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Language Switcher inside voice search */}
                <div className="flex bg-neutral-950/50 border border-earth-border/40 rounded-full p-0.5">
                  <button
                    onClick={() => setLang('kn-IN')}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                      lang === 'kn-IN'
                        ? 'bg-[#c49a2a] text-[#0f0f0b]'
                        : 'text-gold-100/50 hover:text-gold-100'
                    }`}
                  >
                    ಕನ್ನಡ
                  </button>
                  <button
                    onClick={() => setLang('en-US')}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                      lang === 'en-US'
                        ? 'bg-[#c49a2a] text-[#0f0f0b]'
                        : 'text-gold-100/50 hover:text-gold-100'
                    }`}
                  >
                    English
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-[#a09880]" />
                </button>
              </div>
            </div>

            {/* Listening Area */}
            <div className="px-6 py-10 flex flex-col items-center justify-center text-center bg-radial-gradient">
              {/* Pulsing microphone / wave representation */}
              <div className="relative mb-6">
                <AnimatePresence>
                  {isListening && (
                    <>
                      {/* Pulse rings */}
                      <motion.span
                        initial={{ opacity: 0.4, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 2 }}
                        exit={{ opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-full bg-[#c49a2a]"
                      />
                      <motion.span
                        initial={{ opacity: 0.3, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-full bg-[#c49a2a]"
                      />
                    </>
                  )}
                </AnimatePresence>
                <button
                  onClick={isListening ? () => {
                    setIsListening(false);
                    if (recognitionRef.current) recognitionRef.current.stop();
                  } : startSpeech}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isListening
                      ? 'bg-[#c49a2a] text-[#0f0f0b] shadow-[0_0_30px_rgba(196,154,42,0.5)]'
                      : 'bg-[#1e1e16] border border-earth-border text-gold-100 hover:border-gold-400/50 hover:bg-[#24241c]'
                  }`}
                >
                  {isListening ? <Mic size={32} className="animate-pulse" /> : <MicOff size={32} />}
                </button>
              </div>

              {/* Real-time Listening Waveform CSS Animation */}
              {isListening && (
                <div className="flex items-center gap-1 h-8 mb-4">
                  {[...Array(9)].map((_, i) => (
                    <span
                      key={i}
                      className="w-1 bg-[#c49a2a] rounded-full"
                      style={{
                        height: '4px',
                        animation: `audioWave 1.2s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Status Header */}
              <h4 className="text-base font-bold text-[#f0ece0] mb-2 tracking-wide">
                {isListening
                  ? (lang === 'kn-IN' ? 'ನಿಮ್ಮ ಧ್ವನಿ ಆಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Listening to your voice...')
                  : isAnalyzing
                  ? (lang === 'kn-IN' ? 'ಧ್ವನಿ ಆಜ್ಞೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' : 'Analyzing voice command...')
                  : matchedCommand
                  ? (lang === 'kn-IN' ? 'ಆಜ್ಞೆ ಹೊಂದಿಕೆಯಾಗಿದೆ!' : 'Command Matched!')
                  : (lang === 'kn-IN' ? 'ಪ್ರಾರಂಭಿಸಲು ಮೈಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Click mic to start')}
              </h4>

              {/* Live transcript displaying spoken Kannada/English words */}
              <div className="min-h-[50px] max-w-lg px-4 py-2 rounded-xl bg-neutral-950/40 border border-white/5 w-full flex items-center justify-center">
                {transcript ? (
                  <p className="text-sm font-semibold text-gold-200 animate-fade-in italic">
                    "{transcript}"
                  </p>
                ) : (
                  <p className="text-xs text-[#6a6050]">
                    {lang === 'kn-IN'
                      ? 'ಉದಾಹರಣೆಗೆ: "ಬೆಳೆಗಳ ಪಟ್ಟಿ ತೋರಿಸು" ಎಂದು ಹೇಳಿ'
                      : 'For example: Say "show me the list of crops"'}
                  </p>
                )}
              </div>

              {/* Error messages */}
              {errorMsg && (
                <div className="mt-4 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl max-w-md">
                  <AlertCircle size={14} className="shrink-0" />
                  <p className="text-left font-semibold">{errorMsg}</p>
                </div>
              )}

              {/* Navigation confirmation speech synthesis state */}
              {matchedCommand && (
                <div className="mt-4 flex items-center gap-2 text-xs text-[#c49a2a] bg-[#c49a2a]/10 border border-[rgba(196,154,42,0.3)] px-4 py-2.5 rounded-xl">
                  <Volume2 size={14} className="shrink-0 animate-bounce" />
                  <p className="font-bold uppercase tracking-wider">
                    {lang === 'kn-IN'
                      ? `ಪುಟಕ್ಕೆ ಹೋಗಲಾಗುತ್ತಿದೆ: ${matchedCommand.phrase}`
                      : `Opening: ${matchedCommand.action}`}
                  </p>
                </div>
              )}
            </div>

            {/* Template Commands Guide Grid */}
            <div className="px-6 py-5 border-t border-[rgba(255,255,255,0.07)] bg-neutral-950/20">
              <p className="text-[10px] font-black uppercase text-[#6a6050] tracking-widest mb-3">
                {lang === 'kn-IN' ? 'ತ್ವರಿತವಾಗಿ ಪರೀಕ್ಷಿಸಲು ಕೆಳಗಿನವುಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ:' : 'Click to test commands directly:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {commandGuides.map((guide, idx) => (
                  <button
                    key={idx}
                    onClick={() => triggerSampleCommand(guide)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-[#1e1e16]/80 hover:bg-[#24241c] hover:border-[#c49a2a]/30 text-left transition-all duration-200 group active:scale-[0.98]"
                  >
                    <div className="truncate">
                      <p className="text-[11px] font-bold text-[#f0ece0] truncate group-hover:text-[#c49a2a]">
                        {lang === 'kn-IN' ? guide.phrase : guide.englishPhrase}
                      </p>
                      <p className="text-[9px] text-[#6a6050] font-medium tracking-wider uppercase truncate">
                        {guide.action}
                      </p>
                    </div>
                    <ArrowRight size={10} className="text-[#6a6050] group-hover:text-[#c49a2a] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Add CSS audio wave keyframes dynamically to document */}
          <style>{`
            @keyframes audioWave {
              0% { height: 4px; }
              100% { height: 32px; }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
};
