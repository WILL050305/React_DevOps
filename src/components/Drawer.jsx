// Drawer.jsx
import { X } from 'lucide-react';

function Drawer({ onClose }) {
  return (
    <>
      <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transition-transform duration-300">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Menú</h2>
          <button onClick={onClose}>
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
      <div className="fixed inset-0 bg-black/50 z-30" onClick={onClose} />
    </>
  );
}

export default Drawer;