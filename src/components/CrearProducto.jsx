import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CrearProducto({ onSuccess }) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    precio_rebajado: '',
    stock: '',
    categoria_id: '',
    imagen_url: '',
    destacado: false,
    marca: '',
    talla: '',
    id_temporada: '',
  });

  const [showPrecioRebajado, setShowPrecioRebajado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCategorias();
    fetchTemporadas();
  }, []);

  useEffect(() => {
    // Bloquear scroll del fondo al abrir el modal
    document.body.style.overflow = 'hidden';
    return () => {
      // Restaurar scroll al cerrar el modal
      document.body.style.overflow = 'auto';
    };
  }, []);

  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('id_categoria, nombre');
    if (!error) setCategorias(data);
    else setErrorMsg('Error al cargar categorías');
  };

  const fetchTemporadas = async () => {
    const { data, error } = await supabase
      .from('temporadas')
      .select('id_temporada, nombre');
    if (!error) setTemporadas(data);
    else setErrorMsg('Error al cargar temporadas');
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${Date.now()}_${file.name}`;

    // Subir imagen al bucket
    const { error } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (error) {
      setErrorMsg('No se pudo subir la imagen');
      return;
    }

    // Obtener URL pública para la previsualización
    const { data: publicUrlData } = supabase
      .storage
      .from('products')
      .getPublicUrl(fileName);

    // Mostrar imagen en vista previa (preview local)
    setPreviewUrl(publicUrlData.publicUrl);

    // Guardar solo el path en la base de datos
    setForm(prev => ({
      ...prev,
      imagen_url: fileName,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const payload = { ...form };
    if (!showPrecioRebajado) payload.precio_rebajado = null;

    // Validación: el precio rebajado debe ser menor que el precio original
    if (
      showPrecioRebajado &&
      parseFloat(form.precio_rebajado) >= parseFloat(form.precio)
    ) {
      setErrorMsg('El precio rebajado debe ser menor que el precio original');
      setLoading(false);
      return;
    }

    // Nombre en mayúsculas y sin espacios al inicio/final
    payload.nombre = payload.nombre.trim().toUpperCase();

    // Conversión de tipos
    payload.precio = parseFloat(payload.precio);
    payload.precio_rebajado = payload.precio_rebajado ? parseFloat(payload.precio_rebajado) : null;
    payload.stock = parseInt(payload.stock, 10);
    payload.categoria_id = parseInt(payload.categoria_id, 10);
    payload.id_temporada = parseInt(payload.id_temporada, 10);

    console.log('Payload que se enviará:', payload);

    const { error } = await supabase.from('productos').insert([payload]);
    setLoading(false);

    if (error) {
      console.error('Error Supabase:', error);
      setErrorMsg('Error al crear producto: ' + error.message);
    } else {
      if (onSuccess) onSuccess();
      resetForm();
    }
  };

  const resetForm = () => {
    setForm({
      nombre: '',
      descripcion: '',
      precio: '',
      precio_rebajado: '',
      stock: '',
      categoria_id: '',
      imagen_url: '',
      destacado: false,
      marca: '',
      talla: '',
      id_temporada: '',
    });
    setShowPrecioRebajado(false);
    setPreviewUrl('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200"
        aria-label="Formulario para crear producto"
      >
        <button
          type="button"
          onClick={onSuccess}
          className="absolute top-4 right-5 text-gray-400 hover:text-red-500 text-3xl font-bold transition-colors"
          aria-label="Cerrar formulario"
        >
          ×
        </button>

        <h2 className="col-span-full text-3xl font-extrabold text-center mb-4 text-gray-800 tracking-tight">
          Crear Producto
        </h2>

        {errorMsg && (
          <div className="col-span-full bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-2 text-center">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-1 col-span-full">
          <label className="text-sm font-semibold text-gray-700" htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none"
            required
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700" htmlFor="marca">Marca</label>
          <input
            id="marca"
            name="marca"
            value={form.marca}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700" htmlFor="precio">Precio</label>
          <input
            id="precio"
            type="number"
            step="0.01"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none"
            required
            min={0}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700" htmlFor="talla">Talla</label>
          <input
            id="talla"
            name="talla"
            value={form.talla}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700" htmlFor="stock">Existencias</label>
          <input
            id="stock"
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none"
            required
            min={0}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700" htmlFor="categoria_id">Categoría</label>
          <select
            id="categoria_id"
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none"
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map(c => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700" htmlFor="id_temporada">Temporada</label>
          <select
            id="id_temporada"
            name="id_temporada"
            value={form.id_temporada}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none"
            required
          >
            <option value="">Seleccione una temporada</option>
            {temporadas.map(t => (
              <option key={t.id_temporada} value={t.id_temporada}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 col-span-full">
          <label className="text-sm font-semibold text-gray-700" htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none resize-none"
            rows={3}
            required
          />
        </div>

        {/* Agrupa imagen y precio rebajado en una fila */}
        <div className="flex flex-row gap-6 items-start">
          {/* Input de Imagen */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-64 border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div>
              {previewUrl ? (
                <button
                  type="button"
                  onClick={() => setShowImagePreview(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition mt-2"
                >
                  Mostrar vista previa
                </button>
              ) : (
                <span className="text-sm text-gray-400 mt-2">Sin imagen</span>
              )}
            </div>
          </div>

          {/* Input Precio Rebajado con botón */}
          <div className="flex flex-col gap-2 ml-24">
            <button
              type="button"
              onClick={() =>
                setShowPrecioRebajado(prev => {
                  if (prev) setForm(f => ({ ...f, precio_rebajado: '' }));
                  return !prev;
                })
              }
              className={`w-fit px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                showPrecioRebajado ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {showPrecioRebajado ? 'Quitar precio rebajado' : 'Añadir precio rebajado'}
            </button>
            <label className="text-sm font-semibold text-gray-700">Precio rebajado</label>
            <input
              type="number"
              name="precio_rebajado"
              step="0.01"
              value={form.precio_rebajado}
              onChange={handleChange}
              disabled={!showPrecioRebajado}
              className="w-64 border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        {/* Destacado alineado correctamente */}
        <div className="col-span-full flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="destacado"
            name="destacado"
            checked={form.destacado}
            onChange={handleChange}
            className="accent-blue-600 w-5 h-5"
          />
          <label htmlFor="destacado" className="text-sm font-semibold text-gray-700">
            ¿Destacar este producto en la página principal?
            <span className="block text-xs text-gray-400 font-normal">
              (Máximo 20 productos destacados)
            </span>
          </label>
        </div>

        <div className="col-span-full flex justify-between gap-4 mt-6">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onSuccess();
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg w-1/2 font-semibold transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg w-1/2 font-semibold transition"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Crear Producto'}
          </button>
        </div>
      </form>

      {showImagePreview && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="relative bg-white rounded-xl shadow-lg p-6">
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl font-bold transition-colors"
              aria-label="Cerrar vista previa"
            >
              ×
            </button>
            <img src={previewUrl} alt="Vista previa" className="max-w-full max-h-[70vh] rounded-lg shadow" />
          </div>
        </div>
      )}
    </div>
  );
}