// CategorySlider.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

// Asocia cada categoría con su imagen real
const categories = [
  {
    id: 0,
    title: 'Abrigos',
    image: '/images/abrigo.png',
  },
  {
    id: 1,
    title: 'Polos',
    image: '/images/polo.png',
  },
  {
    id: 2,
    title: 'Shorts',
    image: '/images/shorts.png',
  },
  {
    id: 3,
    title: 'Camisas (Polo)',
    image: '/images/camisa polo.png',
  },
  {
    id: 4,
    title: 'Ropa Deportiva',
    image: '/images/Ropa deportiva.png',
  },
  {
    id: 5,
    title: 'Calzado',
    image: '/images/Calzado.png',
  },
];

function CategorySlider() {
  const [page, setPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  // --- Auto-slide cada 10 segundos ---
  useEffect(() => {
    const interval = setInterval(() => {
      setPage((prevPage) => (prevPage + 1) % totalPages);
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [totalPages]);
  // ------------------------------------

  const getItems = (index) => categories.slice(index * itemsPerPage, (index + 1) * itemsPerPage);

  return (
    <div className="bg-white py-10 px-4 md:px-12">
      <div className="flex justify-between items-center mb-6">
        <span className="text-2xl font-semibold">Categorías</span>
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
            <div key={index} className="min-w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-1">
              {getItems(index).map((item) => (
                <div key={item.id} className="bg-gray-100 rounded shadow hover:shadow-xl overflow-hidden transition-transform duration-200 cursor-pointer flex flex-col">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-[28rem] object-cover object-top transition-transform duration-300 hover:scale-105"
                  />
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

export default CategorySlider;