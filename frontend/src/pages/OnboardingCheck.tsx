import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { apiGet } from '@/lib/httpClient';
import { LoadingOverlay } from '@/components/ui/loading-components';

export default function OnboardingCheck() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

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
        if (profile && profile.onboarding_completed) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } catch (err) {
        console.error("Failed to check onboarding status", err);
        navigate('/onboarding'); // Fallback
      }
    };

    checkStatus();
  }, [getToken, navigate]);

  return <LoadingOverlay message="Checking profile..." transparent />;
}
