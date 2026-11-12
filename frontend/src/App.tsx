import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LocationProvider } from './context/LocationContext';
import { EmergencyProvider } from './context/EmergencyContext';

import { Layout } from './components/common/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmergencySosPage } from './pages/EmergencySosPage';
import { LiveLocationPage } from './pages/LiveLocationPage';
import { PublicTrackingPage } from './pages/PublicTrackingPage';
import { EmergencyContactsPage } from './pages/EmergencyContactsPage';
import { CabJourneyPage } from './pages/CabJourneyPage';
import { RouteMonitoringPage } from './pages/RouteMonitoringPage';
import { SafetyTimerPage } from './pages/SafetyTimerPage';
import { TrustedHelpersPage } from './pages/TrustedHelpersPage';
import { EvidenceLockerPage } from './pages/EvidenceLockerPage';
import { EmergencyHistoryPage } from './pages/EmergencyHistoryPage';
import { NotificationCenterPage } from './pages/NotificationCenterPage';
import { SettingsPage } from './pages/SettingsPage';
import { DisguisePage } from './pages/DisguisePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1F3A] flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <LocationProvider>
            <EmergencyProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/calculator" element={<DisguisePage />} />
                <Route path="/track/:shareToken" element={<PublicTrackingPage />} />

                {/* Protected Application Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/emergency" element={<EmergencySosPage />} />
                  <Route path="/location" element={<LiveLocationPage />} />
                  <Route path="/contacts" element={<EmergencyContactsPage />} />
                  <Route path="/cab-safety" element={<CabJourneyPage />} />
                  <Route path="/route-monitoring" element={<RouteMonitoringPage />} />
                  <Route path="/safety-timer" element={<SafetyTimerPage />} />
                  <Route path="/helpers" element={<TrustedHelpersPage />} />
                  <Route path="/evidence" element={<EvidenceLockerPage />} />
                  <Route path="/history" element={<EmergencyHistoryPage />} />
                  <Route path="/notifications" element={<NotificationCenterPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </EmergencyProvider>
          </LocationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
