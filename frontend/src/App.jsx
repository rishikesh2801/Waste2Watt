import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Monitor, X } from 'lucide-react';
import { AppProvider } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import ComplaintPage from './pages/ComplaintPage';
import LoginPage from './pages/LoginPage';
import AIAssistant from './components/AIAssistant';

// Dashboards
import MayorDashboard from './pages/dashboards/MayorDashboard';
import CollectorDashboard from './pages/dashboards/CollectorDashboard';
import VehicleManagerDashboard from './pages/dashboards/VehicleManagerDashboard';
import ServiceMenDashboard from './pages/dashboards/ServiceMenDashboard';

const DesktopAlert = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      const hasDismissed = sessionStorage.getItem('desktopAlertDismissed');
      // On real laptops or when 'Desktop site' is turned on in mobile browsers,
      // the window.innerWidth is typically 980px or higher (definitely >= 768).
      if (window.innerWidth >= 768) {
        setIsVisible(false);
      } else if (!hasDismissed) {
        setIsVisible(true);
      }
    };

    // Initial check
    checkWidth();

    // Listen for changes (e.g., toggling Desktop site mode triggers a resize)
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (!isVisible) return null;

  const dismiss = () => {
    sessionStorage.setItem('desktopAlertDismissed', 'true');
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-green-500"></div>
        <button onClick={dismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-sm ring-1 ring-blue-100">
            <Monitor className="w-10 h-10" />
          </div>
          
          <h2 className="text-xl font-black text-gray-800 mb-3 tracking-tight">Best Viewed on Desktop</h2>
          
          <p className="text-sm text-gray-500 leading-relaxed mb-8 px-2">
            This dashboard contains detailed maps and data tables. For the best experience, please switch to <strong>Desktop Site</strong> in your browser menu, or view on a PC.
          </p>
          
          <button onClick={dismiss} className="w-full bg-[#1a3a6b] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
};


function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-800">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register-complaint" element={<ComplaintPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/mayor/*" element={<MayorDashboard />} />
            <Route path="/collector/*" element={<CollectorDashboard />} />
            <Route path="/vehicle-manager/*" element={<VehicleManagerDashboard />} />
            <Route path="/service-men/*" element={<ServiceMenDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      <AIAssistant />
      <DesktopAlert />
    </AppProvider>
  );
}

export default App;
