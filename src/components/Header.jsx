// Header.jsx
import { useState, useRef, useEffect } from 'react';
import { Menu, Search, User, ShoppingCart, X } from 'lucide-react';
import Drawer from './Drawer';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function Header() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener usuario actual
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Cerrar menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowMenu(false);
    setShowLogoutOverlay(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      setShowLogoutOverlay(false);
      navigate('/');
    }, 1000);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-black text-white w-full py-[14px] shadow-md z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setDrawerOpen((prev) => !prev)}
          className="group relative w-8 h-8 flex flex-col justify-center items-center focus:outline-none z-50"
          aria-label="Abrir menú"
        >
          <span className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ease-in-out ${isDrawerOpen ? 'rotate-45 top-4' : 'top-2 group-hover:w-7'}`}></span>
          <span className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ease-in-out ${isDrawerOpen ? 'opacity-0 left-4' : 'top-4 group-hover:w-7'}`}></span>
          <span className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ease-in-out ${isDrawerOpen ? '-rotate-45 top-4' : 'top-6 group-hover:w-7'}`}></span>
        </button>

        <h1 className="text-xl md:text-2xl font-semibold tracking-wide transition-all duration-300 cursor-pointer hover:scale-110 hover:text-gray-300">
          VEREAU FOR MEN'S
        </h1>

        <div className="flex items-center gap-4 relative">
          <button className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300">
            <Search size={22} />
          </button>
          <div className="relative">
            <button
              onClick={user ? () => setShowMenu((v) => !v) : () => navigate('/auth')}
              className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300 flex items-center gap-2"
              style={user ? { opacity: 0.9 } : {}}
            >
              <User size={22} />
              {user && (
                <span className="ml-1 text-sm font-medium">
                  {user.user_metadata?.nombre || user.email}
                </span>
              )}
            </button>
            {user && showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50"
              >
                <button
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/perfil'); // Cambia la ruta según tu app
                  }}
                >
                  Mi perfil
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 font-semibold"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
          <button className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300">
            <ShoppingCart size={22} />
          </button>
        </div>
      </header>
      {isDrawerOpen && <Drawer onClose={() => setDrawerOpen(false)} />}

      {showLogoutOverlay && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-[9999] transition-opacity">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-black mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-xl font-semibold text-black">Cerrando sesión...</span>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;