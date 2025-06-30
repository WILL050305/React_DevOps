import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CrearCampana({ onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [imagen, setImagen] = useState(null);
  const [mostrar, setMostrar] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubiendo(true);

    let imagen_url = '';

    if (imagen) {
      const nombreArchivo = `${Date.now()}_${imagen.name}`;
      const { error: uploadError } = await supabase
        .storage
        .from('temporada')
        .upload(`private/${nombreArchivo}`, imagen);

      if (uploadError) {
        console.error('Error subiendo imagen:', uploadError);
        setSubiendo(false);
        return;
      }

      imagen_url = `private/${nombreArchivo}`;
    }

    const { error } = await supabase.from('temporadas').insert({
      nombre,
      imagen_url,
      descripcion: `Explora lo mejor de la temporada ${nombre}`,
      mostrar,
    });

    if (error) {
      console.error('Error creando campaña:', error);
    } else {
      onSuccess();
    }

    setSubiendo(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-semibold">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files[0])}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Desea mostrar la campaña?</span>
          <button
            type="button"
            onClick={() => setMostrar(!mostrar)}
            className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
              mostrar ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ${
                mostrar ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <span className="text-xs text-gray-500 ml-1">
          (Esto hara que se muestre en la pantalla principal)
        </span>
      </div>

      <button
        type="submit"
        disabled={subiendo}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {subiendo ? 'Guardando...' : 'Guardar Campaña'}
      </button>
    </form>
  );
}
