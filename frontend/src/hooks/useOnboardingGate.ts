import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet } from "@/lib/httpClient";

export const useOnboardingGate = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoaded || !user) return;
    
    // Don't check onboarding on the onboarding page itself or auth pages
    if (location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/auth')) {
      return;
    }

    const checkOnboarding = async () => {
      try {
        const data = await apiGet<{ completed: boolean }>('/api/users/onboarding-status');
        if (!data.completed) navigate("/onboarding");
      } catch (e) {
        console.error("Failed to check onboarding status", e);
      }
    };

    checkOnboarding();
  }, [isLoaded, user, navigate, location.pathname]);
};
