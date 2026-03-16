import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboardPage } from "@/components/admin/AdminDashboardPage";
import { UserManagementPage } from "@/components/admin/UserManagementPage";
import { PredictionAnalyticsPage } from "@/components/admin/PredictionAnalyticsPage";
import { SystemOverviewPage } from "@/components/admin/SystemOverviewPage";
import { AdminPredictionRecordsPage } from "@/components/admin/AdminPredictionRecordsPage";
import { AdminProfileRecordsPage } from "@/components/admin/AdminProfileRecordsPage";
import HomePage from "@/pages/HomePage";
import PredictRoute from "@/pages/PredictRoute";
import AnalyticsRoute from "@/pages/AnalyticsRoute";
import HistoryRoute from "@/pages/HistoryRoute";
import ProfilesRoute from "@/pages/ProfilesRoute";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import { useAuth } from "@/hooks/use-auth";

const queryClient = new QueryClient();

function AdminRoutes() {
  const { user, signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <AdminRouteGuard>
      <Routes>
        <Route element={<AdminLayout userEmail={user?.email ?? undefined} onSignOut={handleSignOut} />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="predictions" element={<AdminPredictionRecordsPage />} />
          <Route path="profiles" element={<AdminProfileRecordsPage />} />
          <Route path="analytics" element={<PredictionAnalyticsPage />} />
          <Route path="system" element={<SystemOverviewPage />} />
        </Route>
      </Routes>
    </AdminRouteGuard>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth pages - no layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin panel - own layout */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Normal user app - AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/predict" element={<AuthGuard><PredictRoute /></AuthGuard>} />
            <Route path="/analytics" element={<AuthGuard><AnalyticsRoute /></AuthGuard>} />
            <Route path="/history" element={<AuthGuard><HistoryRoute /></AuthGuard>} />
            <Route path="/profiles" element={<AuthGuard><ProfilesRoute /></AuthGuard>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
