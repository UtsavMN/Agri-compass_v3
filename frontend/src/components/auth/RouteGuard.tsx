import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

import { useStore } from "@/store";
import { apiGet, apiPut } from "@/lib/httpClient";

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
            const clerkName = clerkUser.fullName || clerkUser.username || '';
            const clerkImage = clerkUser.imageUrl || '';
            const backendName = profile.fullName || profile.full_name || '';
            const backendImage = profile.profilePictureUrl || profile.avatar_url || '';

            // ONLY seed from Clerk if backend profile is completely missing name or picture
            // Never overwrite user-customized profile pictures or names!
            const isBackendNameMissing = !backendName || backendName === 'New User' || backendName === 'Anonymous Farmer';
            const isBackendImageMissing = !backendImage;

            if ((isBackendNameMissing && clerkName) || (isBackendImageMissing && clerkImage)) {
               try {
                  const updatedProfile = await apiPut('/api/profiles', {
                     fullName: isBackendNameMissing && clerkName ? clerkName : backendName,
                     avatarUrl: isBackendImageMissing && clerkImage ? clerkImage : backendImage
                  });
                  setClerkUserAndProfile(clerkUser, updatedProfile);
                  return;
               } catch (e) {
                  console.error('Failed to auto-sync Clerk data to backend profile', e);
               }
            }
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
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#C9A84C] animate-pulse text-3xl">🌾</div>
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};
