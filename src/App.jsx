// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Drawer from './components/Drawer';
import AdminDrawer from './components/AdminDrawer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import ProductView from './components/ProductView';
import ViewsSelected from './components/ViewsSelected';
import FiltroProductos from './components/FiltroProductos';
import CrearCampaigns from './components/CrearCampaigns';
import EditCampaigns from './components/EditCampaigns';
import PayView from './components/PayView';
import { useState } from 'react';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const hideHeaderRoutes = ['/admin'];
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
            <Route path="/producto/:id" element={<ProductView />} />
            <Route path="/ver/:tipo/:id" element={<ViewsSelected />} />
            <Route path="/views/:tipo/:id" element={<ViewsSelected />} />
            <Route path="/views/crear-campanas" element={<CrearCampaigns />} />
            <Route path="/productos" element={<FiltroProductos />} />
            <Route path="/edit-campaigns" element={<EditCampaigns />} />
            <Route path="/payview" element={<PayView />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!hideFooterRoutes.includes(location.pathname) && <Footer />}
    </div>
  );
}

export default App;


