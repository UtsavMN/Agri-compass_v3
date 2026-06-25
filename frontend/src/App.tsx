import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingOverlay } from '@/components/ui/loading-components';
import { VoiceChatbot } from '@/components/VoiceChatbot';

import { PageTransition } from '@/components/layout/PageTransition';
import Layout from '@/components/Layout';
import { Outlet } from 'react-router-dom';

// Lazy loaded routes
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const CropDetails = React.lazy(() => import('@/pages/CropDetails'));
const MyFarm = React.lazy(() => import('@/pages/MyFarm'));
const MarketPrices = React.lazy(() => import('@/pages/MarketPrices'));
const GovSchemes = React.lazy(() => import('@/pages/GovSchemes'));
const AirAgent = React.lazy(() => import('@/pages/AirAgent'));
const Community = React.lazy(() => import('@/pages/Community'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Weather = React.lazy(() => import('@/pages/Weather'));
const Auth = React.lazy(() => import('@/pages/Auth'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));
const Home = React.lazy(() => import('@/pages/Home'));
const PostDetail = React.lazy(() => import('./pages/PostDetail'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Crops = React.lazy(() => import('@/pages/Crops'));
const SoilAnalysis = React.lazy(() => import('@/pages/SoilAnalysis'));
const Onboarding = React.lazy(() => import('@/pages/Onboarding'));
const OnboardingCheck = React.lazy(() => import('@/pages/OnboardingCheck'));

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
import { dark } from '@clerk/themes';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{ baseTheme: dark }}
      afterSignInUrl="/onboarding-check"
      afterSignUpUrl="/onboarding"
    >
      <ThemeProvider>
        <Router>
          <LanguageProvider>
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
                  <RouteGuard>
                    <MainLayout />
                  </RouteGuard>
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
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
            <Toaster />
            <VoiceChatbot />
          </LanguageProvider>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
