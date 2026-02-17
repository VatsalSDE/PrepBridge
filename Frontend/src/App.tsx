import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from 'react-hot-toast';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';

// Layouts
import DashboardLayout from "./components/layout/DashboardLayout";
import AuthLayout from "./components/layout/AuthLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ContactPage from "./pages/ContactPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import DailyPlanningPage from "./features/planning/pages/DailyPlanningPage";
import CalendarPage from "./features/calendar/pages/CalendarPage";
import ProfilePage from "./features/profile/pages/ProfilePage";
import RoadmapPage from "./features/roadmap/pages/RoadmapPage";
import CommunityPage from "./features/community/pages/CommunityPage";
import ReportsPage from "./features/reports/pages/ReportsPage";
import AchievementsPage from "./features/achievements/pages/AchievementsPage";
import JDMatchingPage from "./features/jdmatching/pages/JDMatchingPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLoginPage from "./features/admin/pages/AdminLoginPage";
import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage";
import AdminUsersPage from "./features/admin/pages/AdminUsersPage";
import AdminCompaniesPage from "./features/admin/pages/AdminCompaniesPage";
import AdminContentPage from "./features/admin/pages/AdminContentPage";
import AdminCommunityPage from "./features/admin/pages/AdminCommunityPage";
import AdminReportsPage from "./features/admin/pages/AdminReportsPage";
import AdminSettingsPage from "./features/admin/pages/AdminSettingsPage";

// Components
import OnboardingWalkthrough from "./components/common/OnboardingWalkthrough";

// Store
import useAuthStore from "./store/authStore";

const queryClient = new QueryClient();

// Protected Route wrapper with onboarding
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('prepbridge_onboarding_complete');
    if (isAuthenticated && !onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingWrapper onComplete={() => setShowOnboarding(false)} />
      )}
      {children}
    </>
  );
};

// Onboarding wrapper with navigation
const OnboardingWrapper = ({ onComplete }) => {
  const navigate = useNavigate();
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <OnboardingWalkthrough 
      onComplete={onComplete}
      onNavigate={handleNavigate}
    />
  );
};

// Public Route wrapper
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <HotToaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--success))',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--destructive))',
              secondary: 'white',
            },
          },
        }}
      />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />
            </Route>
            
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/planning" element={<DailyPlanningPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/jd-matching" element={<JDMatchingPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/companies" element={<AdminCompaniesPage />} />
              <Route path="/admin/content" element={<AdminContentPage />} />
              <Route path="/admin/community" element={<AdminCommunityPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;