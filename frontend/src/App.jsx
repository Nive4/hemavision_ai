import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import DashboardPage from "./pages/DashboardPage";
import ScreeningPage from "./pages/ScreeningPage";
import ChatPage from "./pages/ChatPage";
import NutritionPage from "./pages/NutritionPage";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage";
import SymptomAssessmentPage from "./pages/SymptomAssessmentPage";
import ResultsPage from "./pages/ResultsPage";
import ReportPage from "./pages/ReportPage";

// Protected Route Wrapper
const ProtectedRoute = ({ children, requiresProfile = true }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but no health profile setup
  if (requiresProfile && !profile) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

// Layout for app screens with Sidebar
const AppLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Layout for auth / standalone pages (no Sidebar)
const StandaloneLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<StandaloneLayout><LandingPage /></StandaloneLayout>} />
          <Route path="/login" element={<StandaloneLayout><LoginPage /></StandaloneLayout>} />
          <Route path="/register" element={<StandaloneLayout><RegisterPage /></StandaloneLayout>} />

          {/* Profile setup (Requires login but not profile) */}
          <Route 
            path="/profile-setup" 
            element={
              <ProtectedRoute requiresProfile={false}>
                <StandaloneLayout><ProfileSetupPage /></StandaloneLayout>
              </ProtectedRoute>
            } 
          />

          {/* Protected Application Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AppLayout><DashboardPage /></AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/screening" 
            element={
              <ProtectedRoute>
                <AppLayout><ScreeningPage /></AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/results" 
            element={
              <ProtectedRoute>
                <AppLayout><ResultsPage /></AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/report" 
            element={
              <ProtectedRoute>
                <AppLayout><ReportPage /></AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <AppLayout><ChatPage /></AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nutrition" 
            element={
              <ProtectedRoute>
                <AppLayout><NutritionPage /></AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/progress" 
            element={
              <ProtectedRoute>
                <AppLayout><ProgressPage /></AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <AppLayout><ProfilePage /></AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assessment" 
            element={
              <ProtectedRoute>
                <AppLayout><SymptomAssessmentPage /></AppLayout>
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

