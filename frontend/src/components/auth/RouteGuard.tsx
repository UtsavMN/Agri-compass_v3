import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { LoadingOverlay } from "@/components/ui/loading-components";
import { useStore } from "@/store";
import { apiGet } from "@/lib/httpClient";

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const [profileLoaded, setProfileLoaded] = useState(false);
  const setClerkUserAndProfile = useStore(state => (state as any).setClerkUserAndProfile);
  
  const isLoaded = isAuthLoaded && isUserLoaded;

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      const syncProfile = async () => {
        try {
          const profile = await apiGet('/api/profile/me');
          if (profile) {
            setClerkUserAndProfile(clerkUser, profile);
          }
        } catch (err) {
          console.error("Failed to sync profile with database:", err);
        } finally {
          setProfileLoaded(true);
        }
      };
      syncProfile();
    } else if (isLoaded && !isSignedIn) {
      setProfileLoaded(true);
    }
  }, [isLoaded, isSignedIn, clerkUser, setClerkUserAndProfile]);

  if (!isLoaded || (isSignedIn && !profileLoaded)) {
    return <LoadingOverlay message="Loading profile..." transparent />;
  }

  if (!isSignedIn) return <Navigate to="/auth" />;
  return <>{children}</>;
};
