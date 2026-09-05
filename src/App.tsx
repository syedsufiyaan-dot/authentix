import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DiagnosticProvider } from './context/DiagnosticContext';
import { ToastProvider } from './components/common/Toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthTransition } from './components/layout/AuthTransition';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetOtpPage } from './pages/ResetOtpPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyReportPage } from './pages/VerifyReportPage';

import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { NewDiagnosticPage } from './pages/NewDiagnosticPage';
import { ReportPage } from './pages/ReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { DevicesPage } from './pages/DevicesPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { authTransition } = useAuth();

  return (
    <>
      {authTransition && <AuthTransition />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-otp" element={<ResetOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />`r`n        <Route path="/verify/:reportId" element={<VerifyReportPage />} />

        {/* Protected App Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="diagnostic" element={<NewDiagnosticPage />} />
          <Route path="report/:id" element={<ReportPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <DiagnosticProvider>
            <AppContent />
          </DiagnosticProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

