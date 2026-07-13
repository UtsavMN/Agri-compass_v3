import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet } from "@/lib/httpClient";

export const useOnboardingGate = () => {
  const { getToken, isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoaded || !user || !isSignedIn) return;
    if (location.pathname === "/onboarding") return;

    // Check session cache first — avoid API call on every navigation
    const cacheKey = `onboarding_complete_${user.id}`;
    if (sessionStorage.getItem(cacheKey) === "true") return;

    const check = async () => {
      try {
        const token = await getToken();

        // If token is null, Clerk is not ready yet — do NOT redirect
        if (!token) {
          console.warn("Clerk token not ready yet — skipping onboarding check");
          return;
        }

        const res = await apiGet('/api/users/onboarding-status', token).catch(err => {
          // If 401 — auth is broken, NOT an onboarding issue
          if (err.message.includes('401')) {
            console.error("Auth failed — check Clerk keys and JWT issuer on Render");
          } else {
            console.error(`Onboarding check failed:`, err);
          }
          return null; // Stop here — do not redirect to onboarding
        });

        if (!res) return;

        if (res.completed === true) {
          // Cache so we don't check again this session
          sessionStorage.setItem(cacheKey, "true");
        } else {
          navigate("/onboarding", { replace: true });
        }

      } catch (err: any) {
        // Network error or timeout — do NOT redirect to onboarding
        // The user might just have a slow connection
        console.error("Onboarding check error:", err.message);
      }
    };

    check();
  }, [isLoaded, user, isSignedIn, getToken, navigate, location.pathname]);
};
