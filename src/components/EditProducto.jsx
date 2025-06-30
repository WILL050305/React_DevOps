import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import SelectTallasConStock from './SelectTallasConStock';

export default function EditProducto({ productoId, onSuccess }) {
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
    tallas: [],
  });

  const [showPrecioRebajado, setShowPrecioRebajado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCategorias();
    fetchTemporadas();
    fetchTallas();
    fetchProducto();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
    // eslint-disable-next-line
  }, [productoId]);

  const fetchCategorias = async () => {
    const { data, error } = await supabase.from('categorias').select('id_categoria, nombre');
    if (!error) setCategorias(data);
    else setErrorMsg('Error al cargar categorías');
  };

  const fetchTemporadas = async () => {
    const { data, error } = await supabase.from('temporadas').select('id_temporada, nombre');
    if (!error) setTemporadas(data);
    else setErrorMsg('Error al cargar temporadas');
  };

  const fetchTallas = async () => {
    const { data, error } = await supabase.from('tallas').select('id_talla, nombre');
    if (!error) setTallas(data);
    else setErrorMsg('Error al cargar tallas');
  };

  const fetchProducto = async () => {
    if (!productoId) return;

    const { data: producto, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productoId)
      .single();

    if (error) {
      setErrorMsg('Error al cargar producto');
      return;
    }

    const { data: tallasStock } = await supabase
      .from('producto_talla_stock')
      .select('id_talla, stock')
      .eq('id_producto', productoId);

    setForm({
      nombre: producto.nombre ?? '',
      descripcion: producto.descripcion ?? '',
      precio: producto.precio ?? '',
      precio_rebajado: producto.precio_rebajado ?? '',
      categoria_id: producto.categoria_id ?? '',
      imagen_url: producto.imagen_url ?? '',
      destacado: producto.destacado ?? false,
      marca: producto.marca ?? '',
      id_temporada: producto.id_temporada ?? '',
      tallas: (tallasStock || []).map(t => ({
        id_talla: t.id_talla,
        stock: t.stock ?? 0,
      })),
    });

    setShowPrecioRebajado(!!producto.precio_rebajado);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Lógica para filtrar tallas según la categoría seleccionada
  const tallasPorCategoria = {
    abrigos: ["XS", "S", "M", "L", "XL"],
    camisas: ["XS", "S", "M", "L", "XL"],
    polos: ["XS", "S", "M", "L", "XL"],
    shorts: ["27", "28", "30", "32", "33", "34", "36", "38", "40", "42", "44"],
    pantalones: ["27", "28", "30", "32", "33", "34", "36", "38", "40", "42", "44"],
    calzado: ["38", "39", "40", "41", "42", "43", "44"],
  };

  const categoriaSeleccionada = categorias.find(c => c.id_categoria == form.categoria_id)?.nombre?.toLowerCase();
  const tallasFiltradas = categoriaSeleccionada && tallasPorCategoria[categoriaSeleccionada]
    ? tallas.filter(t => tallasPorCategoria[categoriaSeleccionada].includes(t.nombre))
    : tallas;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('products').upload(fileName, file);

    if (error) {
      setErrorMsg('No se pudo subir la imagen');
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
    setForm(prev => ({
      ...prev,
      imagen_url: publicUrlData.publicUrl,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const payload = { ...form };
    if (!showPrecioRebajado) payload.precio_rebajado = null;

    // Validar precio rebajado
    if (
      showPrecioRebajado &&
      parseFloat(form.precio_rebajado) >= parseFloat(form.precio)
    ) {
      setErrorMsg('El precio rebajado debe ser menor que el precio original');
      setLoading(false);
      return;
    }

    // Actualizar producto
    const { error } = await supabase.from('productos').update({
      nombre: payload.nombre.trim().toUpperCase(),
      descripcion: payload.descripcion,
      precio: parseFloat(payload.precio),
      precio_rebajado: payload.precio_rebajado ? parseFloat(payload.precio_rebajado) : null,
      categoria_id: parseInt(payload.categoria_id, 10),
      imagen_url: payload.imagen_url,
      destacado: payload.destacado,
      marca: payload.marca,
      id_temporada: parseInt(payload.id_temporada, 10),
    }).eq('id', productoId);

    if (error) {
      setErrorMsg('Error al actualizar producto: ' + error.message);
      setLoading(false);
      return;
    }

    // Actualizar tallas y stock
    await supabase.from('producto_talla_stock').delete().eq('id_producto', productoId);

    for (const talla of form.tallas) {
      if (talla.stock > 0) {
        await supabase.from('producto_talla_stock').insert({
          id_producto: productoId,
          id_talla: talla.id_talla,
          stock: talla.stock,
        });
      }
    }

    // Calcula el stock total sumando todos los stock por talla
    const stockTotal = form.tallas.reduce((acc, t) => acc + (t.stock || 0), 0);

    // Luego de insertar las tallas, actualiza el stock total en 'productos'
    await supabase
      .from('productos')
      .update({ stock: stockTotal })
      .eq('id', productoId);

    setLoading(false);

    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200"
        aria-label="Formulario para editar producto"
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
          Editar Producto
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

        {/* Tallas y Stock */}
        <div className="col-span-full">
          <SelectTallasConStock 
            tallas={form.tallas}
            todasLasTallas={tallasFiltradas}
            setTallas={(updater) =>
              setForm(prev => ({
                ...prev,
                tallas: typeof updater === 'function' ? updater(prev.tallas) : updater
              }))
            }
          />
        </div>

        <div className="flex flex-row gap-6 items-start">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-64 border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div>
              {form.imagen_url ? (
                <span className="text-sm text-blue-700 mt-2">Imagen subida</span>
              ) : (
                <span className="text-sm text-gray-400 mt-2">Sin imagen</span>
              )}
            </div>
          </div>

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
              className="w-64 border border-gray-300 p-2 rounded-lg text-base focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100"
              min={0}
            />
          </div>
        </div>

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
            onClick={onSuccess}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg w-1/2 font-semibold transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-1/2 font-semibold transition"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}