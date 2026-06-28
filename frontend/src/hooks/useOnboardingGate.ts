import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";

export const useOnboardingGate = () => {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const check = async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || ""}/api/users/onboarding-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { completed } = await res.json();
        
        if (!completed && location.pathname !== "/onboarding") {
          navigate("/onboarding", { replace: true });
        } else if (completed && location.pathname === "/onboarding") {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Onboarding check failed:", err);
      }
    };
    check();
  }, [isLoaded, user, location.pathname]);
};
