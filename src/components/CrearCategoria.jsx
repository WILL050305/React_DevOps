import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CrearCategoria({ onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagen(file);
    setPreviewUrl(URL.createObjectURL(file));
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
        console.error('Error al subir imagen:', uploadError);
        setErrorMsg('No se pudo subir la imagen');
        setLoading(false);
        return;
      }

      // Obtener URL firmada temporal (válida por 1 hora)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('categorias')
        .createSignedUrl(filePath, 3600);

      if (urlError) {
        setErrorMsg('No se pudo generar la vista previa de la imagen');
        setLoading(false);
        return;
      }

      // Mostrar imagen en vista previa (desde URL firmada)
      setPreviewUrl(signedUrlData.signedUrl);

      imagenPath = filePath;
    }

    const { error } = await supabase
      .from('categorias')
      .insert([{ nombre, imagen_url: imagenPath }]);

    setLoading(false);

    if (error) {
      setErrorMsg('Error al crear categoría');
    } else {
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Crear Categoría</h2>
      {errorMsg && <div className="mb-2 text-red-600">{errorMsg}</div>}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />
        {previewUrl && (
          <img src={previewUrl} alt="Vista previa" className="mt-2 max-h-32 rounded shadow" />
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="bg-gray-200 px-4 py-2 rounded"
          onClick={onSuccess}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Crear'}
        </button>
      </div>
    </form>
  );
}