import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DistrictProvider } from '@/contexts/DistrictContext';
import { Toaster } from '@/components/ui/toaster';

import Dashboard from '@/pages/Dashboard';
import CropDetails from '@/pages/CropDetails';
import MyFarm from '@/pages/MyFarm';
import MarketPrices from '@/pages/MarketPrices';
import GovSchemes from '@/pages/GovSchemes';
import AirAgent from '@/pages/AirAgent';
import Community from '@/pages/Community';
import Profile from '@/pages/Profile';
import Weather from '@/pages/Weather';
import Auth from '@/pages/Auth';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import PostDetail from './pages/PostDetail';
import NotFound from '@/pages/NotFound';
import Crops from '@/pages/Crops';
import SoilAnalysis from '@/pages/SoilAnalysis';


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <DistrictProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Community />} />
                <Route path="/community" element={<Community />} />
                <Route path="/home" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

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
              </Routes>
              <Toaster />
            </Router>
          </DistrictProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
