import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentDashboard from "./pages/StudentDashboard";
import ApplyLeave from "./pages/ApplyLeave";
import ApproverDashboard from "./pages/ApproverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CounsellorDashboard from "./pages/CounsellorDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import GuardDashboard from "./pages/GuardDashboard";
import { ReactNode } from "react";
import { Role } from "./types";
import SignUp from "./pages/SignUp";
import OtpLoginPage from "./pages/OtpLoginPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode; allowedRoles: Role[] }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" />;
  if (!allowedRoles.includes(user!.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/otp-login" element={<OtpLoginPage />} />
    <Route path="/student/*" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
    <Route path="/apply-leave" element={<ProtectedRoute allowedRoles={['student']}><ApplyLeave /></ProtectedRoute>} />
    <Route path="/parent/*" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />
    <Route path="/warden" element={<ProtectedRoute allowedRoles={['warden']}><ApproverDashboard /></ProtectedRoute>} />
    <Route path="/counsellor/*" element={<ProtectedRoute allowedRoles={['counsellor']}><CounsellorDashboard /></ProtectedRoute>} />
    <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin', 'warden']}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/guard/*" element={<ProtectedRoute allowedRoles={['guard', 'admin']}><GuardDashboard /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
