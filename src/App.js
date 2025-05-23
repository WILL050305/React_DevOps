import { useState } from 'react';
import {
  Menu, Search, User, ShoppingCart, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
  
const products = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  title: `Producto ${i + 1}`,
  image: '/images/PORTADA.png' // Sustituye con tus imágenes
}));

const categories = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  title: `Categoría ${i + 1}`,
  image: '/images/PORTADA.png'
}));

function App() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [productPage, setProductPage] = useState(0);
  const [categoryPage, setCategoryPage] = useState(0);

  const itemsPerProductPage = 5;
  const itemsPerCategoryPage = 3;

  const totalProductPages = Math.ceil(products.length / itemsPerProductPage);
  const totalCategoryPages = Math.ceil(categories.length / itemsPerCategoryPage);

  const getProductPageItems = (pageIndex) =>
    products.slice(pageIndex * itemsPerProductPage, (pageIndex + 1) * itemsPerProductPage);

  const getCategoryPageItems = (pageIndex) =>
    categories.slice(pageIndex * itemsPerCategoryPage, (pageIndex + 1) * itemsPerCategoryPage);

  return (
    <div className="min-h-screen w-full overflow-x-hidden font-sans bg-white">

      {/* Sticky Header */}
      <header className="bg-black text-white w-full py-[14px] shadow-md sticky top-0 z-50 flex items-center justify-between px-4">
        <button onClick={() => setDrawerOpen(true)}>
          <Menu size={24} />
        </button>
        <h1 className="text-xl md:text-2xl font-semibold tracking-wide">VEREAU FOR MEN'S</h1>
        <div className="flex items-center gap-4">
          <button><Search size={22} /></button>
          <button><User size={22} /></button>
          <button><ShoppingCart size={22} /></button>
        </div>
      </header>

      {/* Drawer */}
      {isDrawerOpen && (
        <>
          <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transition-transform duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">Menú</h2>
              <button onClick={() => setDrawerOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded">Inicio</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded">Catálogo</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded">Nosotros</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded">Contacto</button>
            </nav>
          </aside>
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setDrawerOpen(false)} />
        </>
      )}

      {/* Portada */}
      <section className="w-full h-[80vh] relative overflow-hidden">
        <img
          src="/images/PORTADA.png"
          alt="Portada"
          className="w-full h-full object-cover object-center"
        />
      </section>

      {/* Nuevos lanzamientos */}
      <div className="bg-white py-10 px-4 md:px-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Nuevos lanzamientos</h2>
          <div className="flex gap-2">
            <button
              className={`p-2 rounded border transition transform active:scale-90 ${
                productPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              onClick={() => setProductPage((prev) => Math.max(prev - 1, 0))}
              disabled={productPage === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className={`p-2 rounded border transition transform active:scale-90 ${
                productPage >= totalProductPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              onClick={() => setProductPage((prev) => Math.min(prev + 1, totalProductPages - 1))}
              disabled={productPage >= totalProductPages - 1}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Deslizador productos */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${productPage * 100}%)` }}
          >
            {Array.from({ length: totalProductPages }).map((_, index) => (
              <div
                key={index}
                className="min-w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 px-1"
              >
                {getProductPageItems(index).map((item) => (
                  <div key={item.id} className="bg-gray-100 rounded shadow hover:shadow-md overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-[28rem] object-cover object-top"
                    />
                    <div className="p-2 text-center text-sm font-medium">{item.title}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categorías */}
      <div className="bg-white py-10 px-4 md:px-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Categorías</h2>
          <div className="flex gap-2">
            <button
              className={`p-2 rounded border transition transform active:scale-90 ${
                categoryPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              onClick={() => setCategoryPage((prev) => Math.max(prev - 1, 0))}
              disabled={categoryPage === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className={`p-2 rounded border transition transform active:scale-90 ${
                categoryPage >= totalCategoryPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              onClick={() => setCategoryPage((prev) => Math.min(prev + 1, totalCategoryPages - 1))}
              disabled={categoryPage >= totalCategoryPages - 1}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Deslizador categorías */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${categoryPage * 100}%)` }}
          >
            {Array.from({ length: totalCategoryPages }).map((_, index) => (
              <div
                key={index}
                className="min-w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-1"
              >
                {getCategoryPageItems(index).map((item) => (
                  <div key={item.id} className="bg-gray-100 rounded shadow hover:shadow-md overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-[28rem] object-cover object-top"
                    />
                    <div className="p-2 text-center text-sm font-medium">{item.title}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
