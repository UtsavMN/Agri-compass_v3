import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingOverlay } from '@/components/ui/loading-components';

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

function App() {
  return (
    <ThemeProvider>
      <Router>
        <LanguageProvider>
          <Suspense fallback={<LoadingOverlay message="Loading Agri Compass..." fullScreen />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Community />} />
              <Route path="/community" element={<Community />} />
              <Route path="/home" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
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
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </LanguageProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
