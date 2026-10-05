import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Cloud, TrendingUp, MessageCircle, HelpCircle, Check, X } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Agri Compass',
    description: 'Your AI-powered agricultural companion for Karnataka farmers',
    icon: Sprout,
    content: 'Get personalized farming advice, weather forecasts, market prices, and connect with fellow farmers.',
  },
  {
    id: 'weather',
    title: 'Weather Insights',
    description: 'Stay ahead of weather conditions',
    icon: Cloud,
    content: 'Get accurate weather forecasts, rainfall predictions, and farming advisories tailored to your district.',
  },
  {
    id: 'market',
    title: 'Market Intelligence',
    description: 'Track crop prices across markets',
    icon: TrendingUp,
    content: 'Access real-time market prices, price trends, and get notified about profitable selling opportunities.',
  },
  {
    id: 'community',
    title: 'Farmer Community',
    description: 'Connect and learn together',
    icon: MessageCircle,
    content: 'Share experiences, ask questions, and learn from other farmers in your region.',
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Your 24/7 farming expert',
    icon: HelpCircle,
    content: 'Ask questions about crops, diseases, fertilizers, and get instant AI-powered answers in Kannada and English.',
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Mark onboarding as completed in localStorage
    localStorage.setItem('onboarding_completed', 'true');
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-leaf-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-leaf-100 rounded-full">
                      {React.createElement(onboardingSteps[currentStep].icon, {
                        className: 'h-12 w-12 text-leaf-600 animate-pulse-soft'
                      })}
                    </div>
                  </div>

                  <CardTitle className="text-2xl mb-2">
                    {onboardingSteps[currentStep].title}
                  </CardTitle>

                  <CardDescription className="text-lg mb-4">
                    {onboardingSteps[currentStep].description}
                  </CardDescription>

                  <p className="text-gold-100/70 text-sm leading-relaxed">
                    {onboardingSteps[currentStep].content}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="transition-all duration-200"
                >
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  className="btn-primary min-w-[100px]"
                >
                  {currentStep === onboardingSteps.length - 1 ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Get Started
                    </>
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
