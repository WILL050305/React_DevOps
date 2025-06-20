import React, { useState } from 'react';
import AdminDrawer from '../components/AdminDrawer';
import { AnimatePresence, motion } from 'framer-motion';
import FiltroProductos from '../components/FiltroProductos';

function Admin() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [section, setSection] = useState('dashboard');

  const handleNavigate = (sectionName) => {
    setSection(sectionName);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Botón hamburguesa */}
      <button
        className="p-2 m-4 rounded focus:outline-none"
        onClick={() => setDrawerOpen(true)}
        aria-label="Abrir menú admin"
      >
        <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
        <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
        <span className="block w-6 h-0.5 bg-gray-800"></span>
      </button>

      {/* Backdrop y Drawer con animación */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              onClick={() => setDrawerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            {/* Drawer */}
            <AdminDrawer
              onClose={() => setDrawerOpen(false)}
              onNavigate={handleNavigate}
            />
          </>
        )}
      </AnimatePresence>

      {/* Contenido principal desplazado cuando el drawer está abierto */}
      <div className="flex-grow flex justify-center items-center ml-64 transition-all duration-300">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center w-full">
          {section === 'dashboard' && (
            <>
              <h2 className="text-2xl font-bold mb-2">Panel de Administración</h2>
              <p className="text-lg">Bienvenido al panel de administrador.</p>
            </>
          )}
          {section === 'productos' && <FiltroProductos />}
          {section === 'ventas' && (
            <h1 className="text-3xl font-bold">Sección Ventas</h1>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;