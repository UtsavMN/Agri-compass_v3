import { create } from 'zustand';

interface TourStore {
  isTourOpen: boolean;
  currentStep: number;
  totalSteps: number;
  startTour: () => void;
  closeTour: () => void;
  skipTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}

export const useTourStore = create<TourStore>((set, get) => ({
  isTourOpen: false,
  currentStep: 0,
  totalSteps: 6,
  startTour: () => {
    set({ isTourOpen: true, currentStep: 0 });
  },
  closeTour: () => {
    try {
      localStorage.setItem('agricompass_tour_completed', 'true');
    } catch (e) {
      console.warn('Unable to persist tour state to localStorage', e);
    }
    set({ isTourOpen: false, currentStep: 0 });
  },
  skipTour: () => {
    try {
      localStorage.setItem('agricompass_tour_completed', 'true');
    } catch (e) {
      console.warn('Unable to persist tour state to localStorage', e);
    }
    set({ isTourOpen: false, currentStep: 0 });
  },
  nextStep: () => {
    const { currentStep, totalSteps, closeTour } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      closeTour();
    }
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  goToStep: (step: number) => {
    const { totalSteps } = get();
    if (step >= 0 && step < totalSteps) {
      set({ currentStep: step });
    }
  },
}));
