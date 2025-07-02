import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // Supabase client for authentication

const drawerVariants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
  exit: { x: '-100%' },
};

const AdminDrawer = ({ onClose, onNavigate }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <motion.aside
      className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg z-50 flex flex-col"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={drawerVariants}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <span className="font-bold text-lg">Admin Panel</span>
        <button
          className="text-gray-400 hover:text-white text-xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
      <nav className="flex-1 flex flex-col gap-2 p-4">
        <button
          className="text-left px-3 py-2 rounded hover:bg-gray-800"
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>
        <button
          className="text-left px-3 py-2 rounded hover:bg-gray-800"
          onClick={() => onNavigate('productos')}
        >
          Productos
        </button>
        <button
          className="text-left px-3 py-2 rounded hover:bg-gray-800"
          onClick={() => onNavigate('ventas')}
        >
          Ventas
        </button>
        <div className="flex-1" />
        <button
          className="text-left px-3 py-2 rounded bg-red-600 hover:bg-red-700 mt-4"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </nav>
    </motion.aside>
  );
};

export default AdminDrawer;