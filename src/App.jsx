// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Drawer from './components/Drawer';
import Portada from './components/Portada';
import ProductSlider from './components/ProductSlider';
import CategorySlider from './components/CategorySlider';
import Campaigns from './components/Campaigns';
import Auth from './pages/Auth';
import { useState } from 'react';

function Home() {
  return (
    <>
      <Portada />
      <ProductSlider />
      <CategorySlider />
      <Campaigns />
    </>
  );
}

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="relative min-h-screen">
      {!isAuthPage && <Header onMenuClick={() => setDrawerOpen(true)} />}
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
          </Routes>
        </AnimatePresence>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;


