import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setGlobalClerkToken } from '@/lib/httpClient';
import { LoadingOverlay } from '@/components/ui/loading-components';

export function ClerkTokenManager({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setTokenReady(true);
      return;
    }
    const updateToken = async () => {
      try {
        const token = await getToken();
        setGlobalClerkToken(token);
        setTokenReady(true);
      } catch (e) {
        console.error("Token err", e);
        setTokenReady(true); // let it fail gracefully so it doesn't block UI forever
      }
    };
    updateToken();
    
    // Refresh token proactively before Clerk expires it
    const interval = setInterval(updateToken, 55000); 
    return () => clearInterval(interval);
  }, [getToken, isLoaded, isSignedIn]);

  if (!tokenReady) return <LoadingOverlay message="Authenticating Secure Session..." transparent />;
  return <>{children}</>;
}
