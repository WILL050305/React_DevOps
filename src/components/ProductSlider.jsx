// ProductSlider.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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

const products = productImages.map((img, i) => ({
  id: i,
  title: `Producto ${i + 1}`,
  image: img
}));

function ProductSlider() {
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(products.length / itemsPerPage);

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
                <div key={item.id} className="bg-gray-100 rounded shadow hover:shadow-xl overflow-hidden transition-transform duration-200 hover:-translate-y-2 cursor-pointer">
                  <img src={item.image} alt={item.title} className="w-full h-[28rem] object-cover object-top" />
                  <div className="p-2 text-center text-sm font-medium">{item.title}</div>
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