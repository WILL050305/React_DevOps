// src/pages/Home.jsx
import Header from '../components/Header';
import Drawer from '../components/Drawer';
import Footer from '../components/Footer';
import ProductSlider from '../components/ProductSlider';
import CategorySlider from '../components/CategorySlider';
import Campaigns from '../components/Campaigns';
import { useState } from 'react';

function Home() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-hidden font-sans bg-white flex flex-col">
      <Header isDrawerOpen={isDrawerOpen} setDrawerOpen={setDrawerOpen} />
      {isDrawerOpen && <Drawer setDrawerOpen={setDrawerOpen} />}

      {/* Portada */}
      <section className="w-full h-[80vh] relative overflow-hidden">
        <img
          src="/images/PORTADA.png"
          alt="Portada"
          className="w-full h-full object-cover object-center"
        />
      </section>

      {/* Nuevos lanzamientos */}
      <ProductSlider />

      {/* Categorías */}
      <CategorySlider />

      {/* Campañas */}
      <Campaigns />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;