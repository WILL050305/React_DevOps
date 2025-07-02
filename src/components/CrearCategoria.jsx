import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CrearCategoria({ onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagen(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    let imagenPath = '';

    if (imagen) {
      const fileName = `${Date.now()}_${imagen.name}`;
      const filePath = `private/${fileName}`;
      const { error: uploadError } = await supabase
        .storage
        .from('categorias')
        .upload(filePath, imagen);

      if (uploadError) {
        setErrorMsg('No se pudo subir la imagen');
        setLoading(false);
        return;
      }

      imagenPath = filePath;
    }

    const { error } = await supabase
      .from('categorias')
      .insert([{ nombre: nombre.trim(), imagen_url: imagenPath }]);

    setLoading(false);

    if (error) {
      setErrorMsg('Error al crear categoría');
    } else {
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
        aria-label="Formulario para crear categoría"
      >
        <h2 className="text-2xl font-extrabold text-center mb-6 text-gray-800 tracking-tight">
          Nueva Categoría
        </h2>

        {errorMsg && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {errorMsg}
          </div>
        )}

        <div className="mb-5">
          <label className="block mb-2 text-sm font-semibold text-gray-700" htmlFor="nombre">
            Nombre de la categoría
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none"
            required
            autoFocus
            placeholder="Ej: Camisas"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm font-semibold text-gray-700" htmlFor="imagen">
            Imagen de la categoría
          </label>
          <input
            id="imagen"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 p-2 rounded-lg text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-2">
            Sube una imagen cuadrada (800x800 recomendado) para evitar deformaciones.
          </p>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-semibold transition"
            onClick={onSuccess}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Crear Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
}