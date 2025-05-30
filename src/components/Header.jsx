// Header.jsx
import { useState } from 'react';
import { Menu, Search, User, ShoppingCart, X } from 'lucide-react';
import Drawer from './Drawer';
import { useNavigate } from 'react-router-dom';

function Header() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-black text-white w-full py-[14px] shadow-md sticky top-0 z-50 flex items-center justify-between px-4">
      <button
        onClick={() => setDrawerOpen((prev) => !prev)}
        className={`group relative w-8 h-8 flex flex-col justify-center items-center focus:outline-none`}
        aria-label="Abrir menú"
      >
        <span className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ${isDrawerOpen ? 'rotate-45 top-4' : 'top-2 group-hover:w-7'}`}></span>
        <span className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ${isDrawerOpen ? 'opacity-0 left-4' : 'top-4 group-hover:w-7'}`}></span>
        <span className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ${isDrawerOpen ? '-rotate-45 top-4' : 'top-6 group-hover:w-7'}`}></span>
      </button>

      <h1 className="text-xl md:text-2xl font-semibold tracking-wide transition-all duration-300 cursor-pointer hover:scale-110 hover:text-gray-300">
        VEREAU FOR MEN'S
      </h1>

      <div className="flex items-center gap-4">
        <button className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300">
          <Search size={22} />
        </button>
        <button onClick={() => navigate('/auth')} className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300">
          <User size={22} />
        </button>
        <button className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300">
          <ShoppingCart size={22} />
        </button>
      </div>

      {isDrawerOpen && <Drawer onClose={() => setDrawerOpen(false)} />}
    </header>
  );
}

export default Header;