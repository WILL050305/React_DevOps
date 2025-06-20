// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Drawer from './components/Drawer';
import AdminDrawer from './components/AdminDrawer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import { useState } from 'react';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const hideHeaderRoutes = ['/admin']; // rutas donde NO quieres mostrar el header
  const hideFooterRoutes = ['/auth', '/admin'];

  return (
    <div className="relative min-h-screen">
      {!isAuthPage && !hideHeaderRoutes.includes(location.pathname) && (
        <Header onMenuClick={() => setDrawerOpen(true)} />
      )}
      {!isAuthPage && drawerOpen && <Drawer onClose={() => setDrawerOpen(false)} />}
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                >
                  <Home />
                </motion.div>
              }
            />
            <Route
              path="/auth"
              element={
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                >
                  <Auth />
                </motion.div>
              }
            />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!hideFooterRoutes.includes(location.pathname) && <Footer />}
    </div>
  );
}

export default App;


