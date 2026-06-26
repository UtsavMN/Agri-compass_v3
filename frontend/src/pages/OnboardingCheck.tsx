import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { apiGet } from '@/lib/httpClient';
import { LoadingOverlay } from '@/components/ui/loading-components';
import { useStore } from '@/store';

export default function OnboardingCheck() {
  const { getToken } = useAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const navigate = useNavigate();
  const setClerkUserAndProfile = useStore(state => (state as any).setClerkUserAndProfile);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = await getToken();
        // Fallback for if backend is not ready, we proceed
        if (!token) {
           navigate('/onboarding');
           return;
        }

        const profile = await apiGet('/api/profile/me');
        if (profile) {
          setClerkUserAndProfile(clerkUser, profile);
          if (profile.onboarding_completed) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        } else {
          navigate('/onboarding');
        }
      } catch (err) {
        console.error("Failed to check onboarding status", err);
        navigate('/onboarding'); // Fallback
      }
    };

    if (isUserLoaded && clerkUser) {
      checkStatus();
    }
  }, [getToken, navigate, clerkUser, isUserLoaded, setClerkUserAndProfile]);

  return <LoadingOverlay message="Checking profile..." transparent />;
}
