import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Drawer({ onClose }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex">
      {/* Drawer animado */}
      <div
        className={`w-64 h-full bg-black text-white shadow-lg p-6 transform transition-transform duration-300 ${
          show ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Menú</h2>
          <button onClick={onClose} className="z-50 relative">
            <X size={24} className="text-white" />
          </button>
        </div>
        <nav className="space-y-2">
          <button
            onClick={() => handleNavigate('/')}
            className="block w-full text-left px-3 py-2 hover:bg-gray-700 rounded"
          >
            Inicio
          </button>
          <button
            onClick={() => handleNavigate('/views/todos/0')}
            className="block w-full text-left px-3 py-2 hover:bg-gray-700 rounded"
          >
            Catálogo
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/');
              setTimeout(() => {
                const target = document.getElementById('campanas');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }, 300); // espera a que cargue la página
            }}
            className="block w-full text-left px-3 py-2 hover:bg-gray-700 rounded"
          >
            Campañas
          </button>
        </nav>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}

export default Drawer;
