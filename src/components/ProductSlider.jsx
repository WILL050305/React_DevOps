// ProductSlider.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

// Lista de imágenes reales (10 productos distintos)
const productImages = [
  '/images/CASACA AMERICANA.jpg',
  '/images/CASACA ÁNGELES BLANCA.jpg',
  '/images/CASACA CUERO CON CAPUCHA.jpg',
  '/images/CASACA IMPERMEABLE.jpg',
  '/images/CHAQUETA PUFFER RLLIN.jpg',
  '/images/CONJUNTO PALM ANGELS.jpg',
  '/images/POLO BOX FIT.jpg',
  '/images/POLO CAMISERO.jpg',
  '/images/POLO MANGA LARGA CON CUELLO.jpg',
  '/images/POLO OVERSIZE TRASLAPE.jpg'
];

const products = [
  {
    id: 0,
    title: 'Casaca Varsity Roja',
    subtitle: 'Street Power',
    price: 149.90,
    image: '/images/CASACA AMERICANA.jpg'
  },
  {
    id: 1,
    title: 'Casaca Urbana Blanca',
    subtitle: 'Angels Drive',
    price: 159.90,
    image: '/images/CASACA ÁNGELES BLANCA.jpg'
  },
  {
    id: 2,
    title: 'Casaca de Cuero Sintético Negra',
    subtitle: 'Black Alpha',
    price: 179.90,
    image: '/images/CASACA CUERO CON CAPUCHA.jpg'
  },
  {
    id: 3,
    title: 'Cortavientos Bicolor Celeste',
    subtitle: 'Sky Motion',
    price: 139.90,
    image: '/images/CASACA IMPERMEABLE.jpg'
  },
  {
    id: 4,
    title: 'Casaca Acolchada Marrón',
    subtitle: 'Urban Warmth',
    price: 169.90,
    image: '/images/CHAQUETA PUFFER RLLIN.jpg'
  },
  {
    id: 5,
    title: 'Buzo Completo Negro',
    subtitle: 'Sport Classic VEREAU',
    price: 149.90,
    image: '/images/CONJUNTO PALM ANGELS.jpg'
  },
  {
    id: 6,
    title: 'Polera Oversize Azul',
    subtitle: 'Blue Vibe',
    price: 59.90,
    image: '/images/POLO BOX FIT.jpg'
  },
  {
    id: 7,
    title: 'Polo Beige Casual',
    subtitle: 'Natural Fit',
    price: 69.90,
    image: '/images/POLO CAMISERO.jpg'
  },
  {
    id: 8,
    title: 'Polera Negra Cuello Alto',
    subtitle: 'Urban Core',
    price: 89.90,
    image: '/images/POLO MANGA LARGA CON CUELLO.jpg'
  },
  {
    id: 9,
    title: 'Polo Negro Deportivo',
    subtitle: 'VEREAU Lines',
    price: 74.90,
    image: '/images/POLO OVERSIZE TRASLAPE.jpg'
  }
];

function ProductSlider() {
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // --- Agrega este useEffect para el auto-slide ---
  useEffect(() => {
    const interval = setInterval(() => {
      setPage((prevPage) => (prevPage + 1) % totalPages);
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [totalPages]);
  // ------------------------------------------------

  const getItems = (index) => products.slice(index * itemsPerPage, (index + 1) * itemsPerPage);

  return (
    <div className="bg-white py-10 px-4 md:px-12">
      <div className="flex justify-between items-center mb-6">
        <span className="text-2xl font-semibold">Nuevos lanzamientos</span>
        <div className="flex gap-2">
          <button className={`p-2 rounded border transition transform active:scale-90 ${page === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`} onClick={() => setPage(Math.max(page - 1, 0))} disabled={page === 0}>
            <ChevronLeft size={20} />
          </button>
          <button className={`p-2 rounded border transition transform active:scale-90 ${page >= totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`} onClick={() => setPage(Math.min(page + 1, totalPages - 1))} disabled={page >= totalPages - 1}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${page * 100}%)` }}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <div key={index} className="min-w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 px-1">
              {getItems(index).map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-100 rounded shadow hover:shadow-xl overflow-hidden transition-transform duration-200 cursor-pointer flex flex-col"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-[28rem] object-cover object-top transition-transform duration-300 hover:scale-105"
                    // El hover:scale-105 hace un acercamiento suave al centro
                  />
                  <div className="p-2 text-center text-sm font-medium flex flex-col gap-1">
                    <div>
                      <span className="font-semibold">{item.subtitle}</span>
                      <span className="text-gray-400 ml-2 text-base font-normal">S/.{item.price.toFixed(2)}</span>
                    </div>
                    <button className="mt-2 bg-black text-white rounded px-4 py-2 text-xs hover:bg-gray-800 transition">
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductSlider;