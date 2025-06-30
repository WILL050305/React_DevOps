import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function DeleteCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [modalCategoriaId, setModalCategoriaId] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('id_categoria, nombre');

    if (error) {
      console.error('Error al obtener categorías:', error);
    } else {
      setCategorias(data);
    }
  };

  const handleDeleteClick = (id) => {
    setModalCategoriaId(id);
    setConfirmText('');
  };

  const eliminarCategoria = async () => {
    const id = modalCategoriaId;
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id_categoria', id);

    if (error) {
      console.error('Error al eliminar categoría:', error);
    } else {
      setCategorias(categorias.filter(c => c.id_categoria !== id));
      setSuccessMessage('Categoría eliminada con éxito.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setModalCategoriaId(null);
      setConfirmText('');
    }
  };

  return (
    <div className="space-y-4 relative">
      <h2 className="text-xl font-bold">Eliminar Categorías</h2>
      <p className="text-sm text-gray-600 mb-2">
        Pulsa eliminar para mostrar la confirmación. Luego escribe <span className="font-semibold">CONFIRMAR</span> para aceptar.
      </p>

      <div className="flex flex-col gap-2">
        {categorias.map(c => (
          <div
            key={c.id_categoria}
            className="flex justify-between items-center border rounded p-4"
          >
            <span className="font-semibold">{c.nombre}</span>
            <button
              onClick={() => handleDeleteClick(c.id_categoria)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded font-semibold"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* Modal flotante */}
      {modalCategoriaId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-2">¿Estás seguro de eliminar esta categoría?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Esta acción no se puede deshacer.
            </p>
            <input
              type="text"
              placeholder="Escribe CONFIRMAR"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="border p-2 rounded w-full mb-4 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalCategoriaId(null)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarCategoria}
                disabled={confirmText !== 'CONFIRMAR'}
                className={`px-4 py-2 rounded text-white text-sm font-semibold ${
                  confirmText === 'CONFIRMAR'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de éxito */}
      {successMessage && (
        <div className="fixed top-4 left-4 bg-green-500 text-white px-4 py-2 rounded shadow-md z-50">
          {successMessage}
        </div>
      )}
    </div>
  );
}
