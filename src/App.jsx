import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Auth/LandingPage';
import { AuthPage } from './pages/Auth/AuthPage';
import { DashboardRouter } from './pages/Dashboard/DashboardRouter';
import { useAppContext } from './AppContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAppContext();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { GlobalFooter } from './components/ui/GlobalFooter';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
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
    "/register"
  ];

  const shouldShowFooter = !hideFooterRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      <div className="flex-1 flex flex-col w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/login" element={<PageTransition><AuthPage defaultIsSignUp={false} /></PageTransition>} />
            <Route path="/register" element={<PageTransition><AuthPage defaultIsSignUp={true} /></PageTransition>} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <PageTransition><DashboardRouter /></PageTransition>
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
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
