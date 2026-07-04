import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";

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

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || ""}/api/users/onboarding-status`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(5000), // 5 second timeout
          }
        );

        // If 401 — auth is broken, NOT an onboarding issue
        // Do NOT redirect to onboarding — show error instead
        if (res.status === 401) {
          console.error("Auth failed — check Clerk keys and JWT issuer on Render");
          return; // Stop here — do not redirect to onboarding
        }

        // If any other error — server issue, do not redirect
        if (!res.ok) {
          console.error(`Onboarding check failed with status ${res.status}`);
          return;
        }

        const data = await res.json();

        if (data.completed === true) {
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
