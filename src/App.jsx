// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Admin from "./pages/Admin";
import { useState } from "react";
import Drawer from "./components/Drawer";
import Portada from "./components/Portada";
import ProductSlider from "./components/ProductSlider";
import CategorySlider from "./components/CategorySlider";
import Campaigns from "./components/Campaigns";
import Auth from "./pages/Auth";

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
  const isAuthPage = location.pathname === "/auth";
  const isAdminPage = location.pathname === "/Admin";

  return (
    <div className="relative min-h-screen">
      {!isAuthPage && !isAdminPage && (
        <Header onMenuClick={() => setDrawerOpen(true)} />
      )}
      {!isAuthPage && drawerOpen && <Drawer onClose={() => setDrawerOpen(false)} />}
      <main>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/Admin" element={<Admin />} />
        </Routes>
      </main>
      {!isAdminPage && location.pathname !== "/Admin" && <Footer />}
    </div>
  );
}

export default App;


