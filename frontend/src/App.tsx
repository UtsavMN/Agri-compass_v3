import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';

import { LoadingOverlay } from '@/components/ui/loading-components';

import { PageTransition } from '@/components/layout/PageTransition';
import Layout from '@/components/Layout';
import { Outlet } from 'react-router-dom';

import { lazyWithRetry } from '@/lib/lazyWithRetry';

// Lazy loaded routes with automatic chunk reload retry
const Dashboard = lazyWithRetry(() => import('@/pages/Dashboard'));
const CropDetails = lazyWithRetry(() => import('@/pages/CropDetails'));
const MyFarm = lazyWithRetry(() => import('@/pages/MyFarm'));
const MarketPrices = lazyWithRetry(() => import('@/pages/MarketPrices'));
const GovSchemes = lazyWithRetry(() => import('@/pages/GovSchemes'));
const AirAgent = lazyWithRetry(() => import('@/pages/AirAgent'));
const Community = lazyWithRetry(() => import('@/pages/Community'));
const Profile = lazyWithRetry(() => import('@/pages/Profile'));
const Weather = lazyWithRetry(() => import('@/pages/Weather'));
const Auth = lazyWithRetry(() => import('@/pages/Auth'));
const ForgotPassword = lazyWithRetry(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazyWithRetry(() => import('@/pages/ResetPassword'));
const Home = lazyWithRetry(() => import('@/pages/Home'));
const PostDetail = lazyWithRetry(() => import('./pages/PostDetail'));
const NotFound = lazyWithRetry(() => import('@/pages/NotFound'));
const Settings = lazyWithRetry(() => import('@/pages/Settings'));
const Crops = lazyWithRetry(() => import('@/pages/Crops'));
const SoilAnalysis = lazyWithRetry(() => import('@/pages/SoilAnalysis'));
const Onboarding = lazyWithRetry(() => import('@/pages/Onboarding'));
const OnboardingCheck = lazyWithRetry(() => import('@/pages/OnboardingCheck'));
const MessagesPage = lazyWithRetry(() => import('@/pages/MessagesPage'));
const ChatPage = lazyWithRetry(() => import('@/pages/ChatPage'));
const PublicProfile = lazyWithRetry(() => import('@/pages/PublicProfile'));
const FollowersPage = lazyWithRetry(() => import('@/pages/FollowersPage'));
const FollowingPage = lazyWithRetry(() => import('@/pages/FollowingPage'));
import { ErrorBoundary } from '@/components/ErrorBoundary';

const MainLayout = () => {
  return (
    <Layout>
      <PageTransition>
        <Outlet />
      </PageTransition>
    </Layout>
  );
};

import { ClerkProvider } from '@clerk/clerk-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { ClerkTokenManager } from '@/components/auth/ClerkTokenManager';
import { dark } from '@clerk/themes';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZGVsaWNhdGUtbW90aC01LmNsZXJrLmFjY291bnRzLmRldiQ=';

if (!PUBLISHABLE_KEY) {
  console.error("Missing Publishable Key");
}

import { AppLoader } from '@/components/AppLoader';
import { startKeepAlive } from '@/lib/keepAlive';

startKeepAlive(); // Ping the server to keep it awake on Render

function App() {
  return (
    <AppLoader>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        appearance={{ baseTheme: dark }}
        signInFallbackRedirectUrl="/onboarding-check"
        signUpFallbackRedirectUrl="/onboarding"
      >
        <ThemeProvider>
          <Router>
            <LanguageProvider>
              <ErrorBoundary>
                <Suspense fallback={<LoadingOverlay message="Loading Agri Compass..." transparent />}>
                  <Routes>
                  {/* Public Routes without persistent Layout */}
                <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
                <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
                <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
                
                {/* Onboarding Routes */}
                <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
                <Route path="/onboarding-check" element={<PageTransition><OnboardingCheck /></PageTransition>} />

                {/* Protected Routes wrapped in persistent Layout */}
                <Route element={
                  <ClerkTokenManager>
                    <RouteGuard>
                      <MainLayout />
                    </RouteGuard>
                  </ClerkTokenManager>
                }>
                  <Route path="/" element={<Community />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/crop/:cropName" element={<CropDetails />} />
                  <Route path="/my-farm" element={<MyFarm />} />
                  <Route path="/market-prices" element={<MarketPrices />} />
                  <Route path="/schemes" element={<GovSchemes />} />
                  <Route path="/air-agent" element={<AirAgent />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/weather" element={<Weather />} />
                  <Route path="/post/:id" element={<PostDetail />} />
                  <Route path="/crops" element={<Crops />} />
                  <Route path="/soil-analysis" element={<SoilAnalysis />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/messages/:userId" element={<ChatPage />} />
                  <Route path="/profile/:userId" element={<PublicProfile />} />
                  <Route path="/profile/:userId/followers" element={<FollowersPage />} />
                  <Route path="/profile/:userId/following" element={<FollowingPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <Toaster />
          </LanguageProvider>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
    </AppLoader>
  );
}

export default App;
