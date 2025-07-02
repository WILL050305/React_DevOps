import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import CrearProducto from './CrearProducto';
import EditProducto from './EditProducto';
import CrearCategoria from './CrearCategoria';
import CrearCampaigns from './CrearCampaigns';
import EditCampaigns from './EditCampaigns';
import DeleteCategorias from './DeleteCategorias';
import { useNavigate } from 'react-router-dom';

export default function FiltroProductos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarCrearCategoria, setMostrarCrearCategoria] = useState(false);
  const [mostrarCrearCampana, setMostrarCrearCampana] = useState(false);
  const [mostrarEditarCampana, setMostrarEditarCampana] = useState(false);
  const [mostrarEliminarCategoria, setMostrarEliminarCategoria] = useState(false);
  const [productoEditarId, setProductoEditarId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [productoEliminado, setProductoEliminado] = useState(false);
  const [refrescar, setRefrescar] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProductos();
  }, [busqueda, refrescar]);

  const fetchProductos = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select(`id, nombre, precio, precio_rebajado, categoria_id (nombre)`);

    if (error) {
      console.error('Error al obtener productos:', error);
      return;
    }

    const texto = busqueda.toLowerCase();
    const filtrados = await Promise.all(
      data
        .filter(p => {
          const nombre = p.nombre?.toLowerCase() || '';
          const categoria = p.categoria_id?.nombre?.toLowerCase() || '';
          return (
            texto === '' ||
            nombre.includes(texto) ||
            categoria.includes(texto)
          );
        })
        .map(async p => {
          const { data: tallas, error: errorTallas } = await supabase
            .from('producto_talla_stock')
            .select('stock')
            .eq('id_producto', p.id);

          const stockTotal = errorTallas
            ? 0
            : tallas.reduce((sum, t) => sum + (t.stock || 0), 0);

          return {
            ...p,
            categoria: p.categoria_id?.nombre || 'Sin categoría',
            stockTotal
          };
        })
    );

    setProductos(filtrados);
  };

  const handleEliminar = async (id) => {
    setProductoAEliminar(id);
    setShowDeleteModal(true);
    setConfirmText('');
  };

  const confirmarEliminar = async () => {
    const { error } = await supabase.from('productos').delete().eq('id', productoAEliminar);
    if (error) {
      console.error('Error al eliminar:', error);
    } else {
      setProductos(productos.filter(p => p.id !== productoAEliminar));
      setProductoEliminado(true);
      setTimeout(() => setProductoEliminado(false), 3000);
    }
    setShowDeleteModal(false);
    setProductoAEliminar(null);
    setConfirmText('');
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      {productoEliminado && (
        <div className="mb-2 w-full flex justify-center">
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded text-center font-semibold shadow">
            El producto ha sido eliminado con éxito.
          </div>
        </div>
      )}

      {/* Input de búsqueda ocupa todo el ancho */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o categoría"
          className="w-full p-2 border rounded h-10"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Opciones de acciones en una fila debajo del input */}
      <div className="flex flex-wrap gap-3 mb-4 justify-center">
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 h-10 rounded flex items-center gap-2"
          onClick={() => setMostrarCrearCampana(true)}
        >
          <span className="text-lg">➕</span>
          <span>Crear Campañas</span>
        </button>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 h-10 rounded flex items-center gap-2"
          onClick={() => setMostrarEditarCampana(true)}
        >
          <span className="text-lg">✎</span>
          <span>Editar Campañas</span>
        </button>
        <button
          className="bg-red-400 hover:bg-red-500 text-white px-4 h-10 rounded flex items-center gap-2"
          onClick={() => setMostrarEliminarCategoria(true)}
        >
          <span className="text-lg">🗑</span>
          <span>Eliminar Categorías</span>
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 rounded flex items-center gap-2"
          onClick={() => setMostrarCrearCategoria(true)}
        >
          <span className="text-lg">➕</span>
          <span>Crear Categorías</span>
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded flex items-center gap-2"
          onClick={() => setMostrarFormulario(true)}
        >
          <span className="text-lg">➕</span>
          <span>Crear Producto</span>
        </button>
      </div>

      {/* Tabla de productos */}
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Nombre</th>
            <th className="p-2">Categoría</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Stock Total</th>
            <th className="p-2 pl-8">Acciones</th>
            <th className="p-2">
              <button
                className="p-2 rounded hover:bg-gray-200"
                onClick={() => setRefrescar(r => !r)}
                title="Actualizar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 4V1L7 6l5 5V7c3.31 0 6 2.69 6 6a6 6 0 1 1-6-6h-1.5a.5.5 0 0 1 0-1H12z" />
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-2 font-medium">{p.nombre}</td>
              <td className="p-2">{p.categoria}</td>
              <td className="p-2">
                {p.precio_rebajado ? (
                  <span className="text-red-600 font-bold">S/ {p.precio_rebajado}</span>
                ) : (
                  <span className="font-bold">S/ {p.precio}</span>
                )}
              </td>
              <td className="p-2">{p.stockTotal}</td>
              {/* Acciones más a la derecha y con iconos */}
              <td className="p-2 pl-8 space-y-2 w-40">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded flex items-center gap-1 mb-1 w-full"
                  onClick={() => setProductoEditarId(p.id)}
                  title="Editar"
                >
                  <span>✎</span>
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleEliminar(p.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded flex items-center gap-1 w-full"
                  title="Eliminar"
                >
                  <span>🗑</span>
                  <span>Eliminar</span>
                </button>
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Cerrar advertencia"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-2 text-gray-800">¿Estás seguro de eliminar este producto?</h3>
            <p className="mb-4 text-gray-600 text-sm">
              Esta acción no se puede deshacer.<br />
              Escribe <span className="font-mono font-bold">CONFIRMAR</span> para habilitar el botón "Aceptar".
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Escribe CONFIRMAR"
              className="w-full border border-gray-300 rounded p-2 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 rounded text-white font-semibold transition ${
                  confirmText === 'CONFIRMAR'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 cursor-not-allowed'
                }`}
                disabled={confirmText !== 'CONFIRMAR'}
                onClick={confirmarEliminar}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Campañas */}
      {mostrarCrearCampana && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setMostrarCrearCampana(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <CrearCampaigns onSuccess={() => { setMostrarCrearCampana(false); setRefrescar(r => !r); }} />
          </div>
        </div>
      )}

      {/* Modal Editar Campañas */}
      {mostrarEditarCampana && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setMostrarEditarCampana(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <EditCampaigns onClose={() => setMostrarEditarCampana(false)} />
          </div>
        </div>
      )}

      {/* Modal Crear Categorías */}
      {mostrarCrearCategoria && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setMostrarCrearCategoria(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <CrearCategoria onSuccess={() => { setMostrarCrearCategoria(false); setRefrescar(r => !r); }} />
          </div>
        </div>
      )}

      {/* Modal Crear Producto */}
      {mostrarFormulario && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setMostrarFormulario(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <CrearProducto onSuccess={() => { setMostrarFormulario(false); setRefrescar(r => !r); }} />
          </div>
        </div>
      )}

      {/* Modal Editar Producto */}
      {productoEditarId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setProductoEditarId(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <EditProducto
              productoId={productoEditarId}
              onSuccess={() => {
                setProductoEditarId(null);
                setRefrescar(r => !r);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Eliminar Categoría */}
      {mostrarEliminarCategoria && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setMostrarEliminarCategoria(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <DeleteCategorias onSuccess={() => {
              setMostrarEliminarCategoria(false);
              setRefrescar(r => !r);
            }} />
          </div>
        </div>
      )}
    </div>
  );
}