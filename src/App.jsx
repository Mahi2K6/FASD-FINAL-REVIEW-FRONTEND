import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/Auth/LandingPage';
import AuthPage from './pages/Auth/AuthPage';
import DashboardRouter from './pages/Dashboard/DashboardRouter';
import Checkout from './pages/Checkout/Checkout';
import { useAppContext } from './AppContext';
import PageLoaderTransition from './components/ui/PageLoaderTransition';

const VideoCall = React.lazy(() => import('./pages/VideoCall/VideoCall'));

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAppContext();
  
  if (!currentUser) {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return <Navigate to="/login" replace />;
    }
  }
  
  return children;
};

import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import GlobalFooter from './components/ui/GlobalFooter';

// Premium page transition with blur-fade
const pageTransitionVariants = {
  initial: { 
    opacity: 0, 
    y: 12, 
    filter: 'blur(8px)',
    scale: 0.995 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.04
    }
  },
  exit: { 
    opacity: 0, 
    y: -6, 
    filter: 'blur(4px)',
    scale: 0.998,
    transition: { 
      duration: 0.2, 
      ease: [0.4, 0, 1, 1] 
    }
  }
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".nav-pill");
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hideFooterRoutes = [
    "/dashboard",
    "/patient",
    "/doctor",
    "/admin",
    "/pharmacist",
    "/appointments",
    "/records",
    "/payment",
    "/profile",
    "/login",
    "/register",
    "/auth",
    "/admin-dashboard",
    "/doctor-dashboard",
    "/doctor-earnings",
    "/pharmacist-dashboard",
    "/patient-dashboard",
    "/video-call"
  ];

  const shouldShowFooter = !hideFooterRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      <div className="flex-1 flex flex-col w-full">
        <AnimatePresence>
          <Routes location={location} key={location.pathname.split('/').slice(0, 2).join('/')}>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/login" element={<PageTransition><AuthPage defaultIsSignUp={false} /></PageTransition>} />
            <Route path="/register" element={<PageTransition><AuthPage defaultIsSignUp={true} /></PageTransition>} />
            <Route path="/auth" element={<PageTransition><AuthPage defaultIsSignUp={false} /></PageTransition>} />
            <Route path="/checkout" element={<ProtectedRoute><PageTransition><Checkout /></PageTransition></ProtectedRoute>} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <PageTransition><DashboardRouter /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/admin-dashboard/*" element={
              <ProtectedRoute>
                <PageTransition><DashboardRouter /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/doctor-earnings/*" element={
              <ProtectedRoute>
                <PageTransition><DashboardRouter /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/patient-dashboard/*" element={
              <ProtectedRoute>
                <PageTransition><DashboardRouter /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/doctor-dashboard/*" element={
              <ProtectedRoute>
                <PageTransition><DashboardRouter /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/pharmacist-dashboard/*" element={
              <ProtectedRoute>
                <PageTransition><DashboardRouter /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/profile/*" element={
              <ProtectedRoute>
                <PageTransition><DashboardRouter /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/settings/*" element={
              <ProtectedRoute>
                <PageTransition><DashboardRouter /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/video-call/:appointmentId" element={
              <ProtectedRoute>
                <React.Suspense fallback={<div className="fixed inset-0 bg-slate-900 flex items-center justify-center"><div className="w-10 h-10 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" /></div>}>
                  <VideoCall />
                </React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
      {shouldShowFooter && <GlobalFooter />}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <PageLoaderTransition />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
