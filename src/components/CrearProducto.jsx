import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CrearProducto({ onSuccess }) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    precio_rebajado: '',
    categoria_id: '',
    imagen_url: '',
    destacado: false,
    marca: '',
    id_temporada: '',
  });

  const [selectedTallas, setSelectedTallas] = useState([]);
  const [tallaStock, setTallaStock] = useState({});
  const [tallas, setTallas] = useState([]);

  const [showPrecioRebajado, setShowPrecioRebajado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCategorias();
    fetchTemporadas();
    fetchTallas();
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

  const fetchTallas = async () => {
    const { data, error } = await supabase
      .from('tallas')
      .select('id_talla, nombre');
    if (!error) setTallas(data);
    else setErrorMsg('Error al cargar tallas');
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTallaChange = (id_talla) => {
    setSelectedTallas(prev => {
      if (prev.includes(id_talla)) {
        // Si se deselecciona la talla, también remover su stock
        const { [id_talla]: _, ...rest } = tallaStock;
        setTallaStock(rest);
        return prev.filter(id => id !== id_talla);
      } else {
        return [...prev, id_talla];
      }
    });
  };

  const handleStockTallaChange = (id_talla, value) => {
    setTallaStock(prev => ({
      ...prev,
      [id_talla]: value
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

    // Validar que se hayan seleccionado tallas
    if (selectedTallas.length === 0) {
      setErrorMsg('Debe seleccionar al menos una talla');
      setLoading(false);
      return;
    }

    // Validar que todas las tallas seleccionadas tengan stock
    const tallasConStockVacio = selectedTallas.filter(id_talla => !tallaStock[id_talla] || tallaStock[id_talla] === '');
    if (tallasConStockVacio.length > 0) {
      setErrorMsg('Todas las tallas seleccionadas deben tener stock asignado');
      setLoading(false);
      return;
    }

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
    payload.categoria_id = parseInt(payload.categoria_id, 10);
    payload.id_temporada = parseInt(payload.id_temporada, 10);

    console.log('Payload que se enviará:', payload);

    // Insertar el producto y obtener su ID
    const { data: producto, error } = await supabase
      .from('productos')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      console.error('Error Supabase:', error);
      setErrorMsg('Error al crear producto: ' + error.message);
      setLoading(false);
      return;
    }

    // Insertar las tallas con stock
    const inserciones = selectedTallas.map(id_talla => ({
      id_producto: producto.id,
      id_talla,
      stock: parseInt(tallaStock[id_talla], 10)
    }));

    const { error: errorTalla } = await supabase
      .from('producto_talla_stock')
      .insert(inserciones);

    setLoading(false);

    if (errorTalla) {
      console.error('Error al insertar tallas:', errorTalla);
      setErrorMsg('Error al registrar tallas: ' + errorTalla.message);
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
      categoria_id: '',
      imagen_url: '',
      destacado: false,
      marca: '',
      id_temporada: '',
    });
    setSelectedTallas([]);
    setTallaStock({});
    setShowPrecioRebajado(false);
    setErrorMsg('');
  };

  // Mapeo de categorías a tallas permitidas
  const tallasPorCategoria = {
    abrigos:    ["XS", "S", "M", "L", "XL"],
    camisas:    ["XS", "S", "M", "L", "XL"],
    polos:      ["XS", "S", "M", "L", "XL"],
    shorts:     ["27", "28", "30", "32", "33", "34", "36", "38", "40", "42", "44"],
    pantalones: ["27", "28", "30", "32", "33", "34", "36", "38", "40", "42", "44"],
    calzado:    ["38", "39", "40", "41", "42", "43", "44"],
  };

  // Determinar la categoría seleccionada (nombre)
  const categoriaSeleccionada = categorias.find(c => c.id_categoria == form.categoria_id)?.nombre?.toLowerCase();

  // Filtrar tallas según la categoría
  const tallasFiltradas = categoriaSeleccionada && tallasPorCategoria[categoriaSeleccionada]
    ? tallas.filter(t => tallasPorCategoria[categoriaSeleccionada].includes(t.nombre))
    : tallas;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200"
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

        {/* Sección de Tallas y Stock */}
        <div className="col-span-full">
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Tallas disponibles</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            {tallasFiltradas.map(talla => (
              <div key={talla.id_talla} className="flex flex-col gap-2 p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`talla-${talla.id_talla}`}
                    checked={selectedTallas.includes(talla.id_talla)}
                    onChange={() => handleTallaChange(talla.id_talla)}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <label htmlFor={`talla-${talla.id_talla}`} className="text-sm font-medium text-gray-700">
                    {talla.nombre}
                  </label>
                </div>
                {selectedTallas.includes(talla.id_talla) && (
                  <input
                    type="number"
                    min="0"
                    value={tallaStock[talla.id_talla] || ''}
                    onChange={(e) => handleStockTallaChange(talla.id_talla, e.target.value)}
                    placeholder="Stock"
                    className="border border-gray-300 p-1 rounded text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    required
                  />
                )}
              </div>
            ))}
          </div>
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
              (Hara que el producto aparezca en la sección de destacados)
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
    </div>
  );
}