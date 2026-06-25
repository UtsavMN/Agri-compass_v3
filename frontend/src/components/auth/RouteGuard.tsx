import React from 'react';
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { LoadingOverlay } from "@/components/ui/loading-components";

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <LoadingOverlay message="Authenticating..." transparent />;
  if (!isSignedIn) return <Navigate to="/auth" />;
  return <>{children}</>;
};
