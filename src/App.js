import { useState } from 'react';
import {
  Menu, Search, User, ShoppingCart, X,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

const products = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  title: `Producto ${i + 1}`,
  image: '/images/PORTADA.png'
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
    <div className="min-h-screen w-full overflow-x-hidden font-sans bg-white flex flex-col">

      {/* Sticky Header */}
      <header className="bg-black text-white w-full py-[14px] shadow-md sticky top-0 z-50 flex items-center justify-between px-4">
  {/* Botón menú hamburguesa animado */}
  <button
    onClick={() => setDrawerOpen((prev) => !prev)}
    className={`group relative w-8 h-8 flex flex-col justify-center items-center focus:outline-none`}
    aria-label="Abrir menú"
  >
    {/* Líneas del menú hamburguesa animadas */}
    <span
      className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300
        ${isDrawerOpen ? 'rotate-45 top-4' : 'top-2 group-hover:w-7'}`}
    ></span>
    <span
      className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300
        ${isDrawerOpen ? 'opacity-0 left-4' : 'top-4 group-hover:w-7'}`}
    ></span>
    <span
      className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300
        ${isDrawerOpen ? '-rotate-45 top-4' : 'top-6 group-hover:w-7'}`}
    ></span>
  </button>
  <h1
  className="text-xl md:text-2xl font-semibold tracking-wide transition-all duration-300 cursor-pointer hover:scale-110 hover:text-gray-300"
>
  VEREAU FOR MEN'S
</h1>
  <div className="flex items-center gap-4">
    <button className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300">
      <Search size={22} />
    </button>
    <button className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300">
      <User size={22} />
    </button>
    <button className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300">
      <ShoppingCart size={22} />
    </button>
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
          <span className="text-2xl font-semibold">
    Nuevos lanzamientos
  </span>
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
                  <div
                    key={item.id}
                    className="bg-gray-100 rounded shadow hover:shadow-xl overflow-hidden transition-transform duration-200 hover:-translate-y-2 cursor-pointer"
                  >
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
          <span className="text-2xl font-semibold">
    Categorías
  </span>
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
                  <div
                    key={item.id}
                    className="bg-gray-100 rounded shadow hover:shadow-xl overflow-hidden transition-transform duration-200 hover:-translate-y-2 cursor-pointer"
                  >
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

      {/* Campañas de Verano e Invierno */}
      <div className="bg-white py-10 px-4 md:px-12">
        <span className="text-2xl font-semibold mb-6 block">
          Campañas de Temporada
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campaña de Verano */}
          <div className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2 cursor-pointer">
            <img
              src="/images/PORTADA.png"
              alt="Campaña de Verano"
              className="w-full h-[22rem] object-cover"
            />
            <div className="absolute bottom-0 w-full bg-black/60 text-white p-4">
              <h3 className="text-xl font-semibold">Campaña de Verano</h3>
              <p className="text-sm">¡Descubre lo último para el calor con estilo!</p>
            </div>
          </div>

          {/* Campaña de Invierno */}
          <div className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2 cursor-pointer">
            <img
              src="/images/PORTADA.png"
              alt="Campaña de Invierno"
              className="w-full h-[22rem] object-cover"
            />
            <div className="absolute bottom-0 w-full bg-black/60 text-white p-4">
              <h3 className="text-xl font-semibold">Campaña de Invierno</h3>
              <p className="text-sm">Abrígate con lo mejor de nuestra colección invernal.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER - Último dentro del JSX */}
      <footer className="bg-black text-white py-10 px-8 mt-auto">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">

    {/* Sección "Más información" */}
    <div className="flex-1 text-left">
      <h3 className="text-lg font-bold mb-4">Más información</h3>
      <ul className="space-y-2 text-sm">
        <li><a href="#" className="hover:underline">Conócenos</a></li>
        <li><a href="#" className="hover:underline">Nosotros</a></li>
        <li><a href="#" className="hover:underline">Jacto</a></li>
        <li><a href="#" className="hover:underline">Decarios</a></li>
        <li><a href="#" className="hover:underline">Encuéntranos</a></li>
      </ul>
    </div>

    {/* Sección "Únete a Bassika" */}
    <div className="flex-1 text-left">
      <h3 className="text-lg font-bold mb-4">¡Únete a VEREAU FOR MEN'S!</h3>
      <p className="text-sm mb-4">Sé la primera en enterarte de nuestras novedades y ofertas especiales!</p>
      
      <form className="space-y-3">
  <div className="relative">
    <label className="block text-sm mb-1">Correo electrónico</label>
    <input
      type="email"
      className="w-full px-3 py-2 pr-10 rounded text-black border border-gray-300"
      placeholder="Ingresa tu correo"
    />
    {/* Flecha como botón dentro del input */}
    <button
      type="submit"
      className="absolute top-[36px] right-[10px] flex items-center p-0 bg-transparent border-none outline-none transition-transform duration-200 hover:text-gray-600 focus:text-gray-600 hover:scale-125"
      tabIndex={0}
      aria-label="Enviar"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </button>
  </div>

  <div className="flex items-center">
    <input
      type="checkbox"
      id="newsletter"
      className="mr-2"
    />
    <label htmlFor="newsletter" className="text-sm">
      Acepta recibir boletín. Consulta nuestra Política de Privacidad.
    </label>
  </div>
</form>
    </div>

    {/* Separador visual */}
    <div className="w-full md:hidden h-px bg-gray-700 my-4"></div>

    {/* Información de contacto y derechos */}
    <div className="flex-1 text-left md:text-right space-y-4">
      <h3 className="text-lg font-bold">VEREAU FOR MEN'S</h3>
      <p className="text-sm">Email: contacto@vereau.com</p>
      <p className="text-sm">Teléfono: +51 987 654 321</p>
      <p className="text-sm">Dirección: Av. Ejemplo 123, Lima, Perú</p>
    </div>
  </div>

  <div className="text-center text-sm text-gray-400 mt-8 border-t border-gray-800 pt-6">
    © 2025 VEREAU FOR MEN'S. Todos los derechos reservados.
  </div>
</footer>



    </div>
  );
}

export default App;
