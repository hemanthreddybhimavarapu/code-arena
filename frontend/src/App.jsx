import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Footer from './components/ui/Footer';

import FloatingLanguageSwitcher from './components/ui/FloatingLanguageSwitcher';
import ErrorBoundary from './components/ErrorBoundary';
import InteractiveCursorGlow from './components/ui/InteractiveCursorGlow';

import { isAdminUser } from './utils/admin';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import ProblemWorkspace from './pages/ProblemWorkspace';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, requireAdmin = false, preventAdmin = false, allowGuest = false }) => {
  const { token, user } = useApp();

  if (!token && !allowGuest) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = isAdminUser(user);

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (preventAdmin && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const MainLayout = () => {
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith('/problems/');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route 
            path="/problems" 
            element={
              <ProtectedRoute allowGuest={true}>
                <ErrorBoundary>
                  <Problems />
                </ErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/problems/:id" 
            element={
              <ProtectedRoute allowGuest={true}>
                <ErrorBoundary>
                  <ProblemWorkspace />
                </ErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute allowGuest={true}>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute preventAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isWorkspace && <Footer />}
      <FloatingLanguageSwitcher />
      <Toast />
    </div>
  );
};

const AppContent = () => {
  const { theme } = useApp();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-darkBg text-white' : 'bg-white text-gray-900'}`}>
      <InteractiveCursorGlow />
      <Router>
        <ErrorBoundary>
          <MainLayout />
        </ErrorBoundary>
      </Router>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
