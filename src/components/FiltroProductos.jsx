import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import CrearProducto from './CrearProducto';
import EditProducto from './EditProducto'; // <-- Importa el componente
import Modal from '../components/Modal'; // ajusta el path si es necesario
import CrearCategoria from './CrearCategoria';

export default function FiltroProductos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [stockFiltro, setStockFiltro] = useState('');
  const [operador, setOperador] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarCrearCategoria, setMostrarCrearCategoria] = useState(false);

  // Nuevo estado para el modal de edición
  const [productoEditarId, setProductoEditarId] = useState(null);

  // Nuevo estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [productoEliminado, setProductoEliminado] = useState(false);

  // Nuevo estado para forzar actualización de la tabla
  const [refrescar, setRefrescar] = useState(false);

  useEffect(() => {
    fetchProductos();
    // eslint-disable-next-line
  }, [busqueda, stockFiltro, operador, refrescar]);

  const fetchProductos = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id,
        nombre,
        precio,
        stock,
        categoria_id (nombre),
        id_temporada (nombre)
      `);

    if (error) {
      console.error('Error al obtener productos:', error);
    } else {
      const texto = busqueda.toLowerCase();
      const stockNum = parseInt(stockFiltro);

      const filtrados = data.filter(p => {
        const nombre = p.nombre?.toLowerCase() || '';
        const categoria = p.categoria_id?.nombre?.toLowerCase() || '';
        const temporada = p.id_temporada?.nombre?.toLowerCase() || '';

        const coincideTexto =
          texto === '' ||
          nombre.includes(texto) ||
          categoria.includes(texto) ||
          temporada.includes(texto);

        const coincideStock =
          !stockFiltro || !operador
            ? true
            : operador === '>' ? p.stock > stockNum :
              operador === '<' ? p.stock < stockNum :
              operador === '=' ? p.stock === stockNum : true;

        return coincideTexto && coincideStock;
      });

      setProductos(filtrados);
    }
  };

  const toggleOperador = (op) => {
    setOperador(prev => (prev === op ? '' : op));
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
      setTimeout(() => setProductoEliminado(false), 3000); // Oculta el mensaje después de 3 segundos
    }
    setShowDeleteModal(false);
    setProductoAEliminar(null);
    setConfirmText('');
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* Mensaje de confirmación de eliminación */}
      {productoEliminado && (
        <div className="mb-2 w-full flex justify-center">
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded text-center font-semibold shadow">
            El producto ha sido eliminado con éxito.
          </div>
        </div>
      )}

      <div className="flex justify-between items-center space-x-2">
        <input
          type="text"
          placeholder="Buscar por nombre, categoría o temporada"
          className="flex-grow max-w-md p-2 border rounded h-10"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {/* Botón Crear Categorías a la izquierda */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 rounded flex items-center"
          onClick={() => setMostrarCrearCategoria(true)}
          style={{ minWidth: 'fit-content' }}
        >
          + Crear Categorías
        </button>
        {/* Botón Crear Producto a la derecha */}
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded flex items-center"
          onClick={() => setMostrarFormulario(true)}
          style={{ minWidth: 'fit-content' }}
        >
          + Crear Producto
        </button>
      </div>

      {mostrarFormulario && (
        <Modal onClose={() => setMostrarFormulario(false)}>
          <CrearProducto onSuccess={() => setMostrarFormulario(false)} />
        </Modal>
      )}

      {mostrarCrearCategoria && (
        <Modal onClose={() => setMostrarCrearCategoria(false)}>
          <CrearCategoria onSuccess={() => setMostrarCrearCategoria(false)} />
        </Modal>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="number"
          placeholder="Stock"
          className="p-2 border rounded"
          value={stockFiltro}
          onChange={e => {
            const value = e.target.value;
            setStockFiltro(value);
            if (value === '') setOperador('');
          }}
        />
        {['>', '<', '='].map(op => (
          <button
            key={op}
            onClick={() => toggleOperador(op)}
            className={`px-3 py-1 rounded border ${
              operador === op ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">ID</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Acciones</th>
            {/* Botón de actualizar a la derecha de Acciones */}
            <th className="p-2">
              <button
                className="p-2 rounded hover:bg-gray-200"
                onClick={() => setRefrescar(r => !r)}
                title="Actualizar"
              >
                {/* Icono circular de actualizar (refresh) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 4V1L7 6l5 5V7c3.31 0 6 2.69 6 6a6 6 0 1 1-6-6h-1.5a.5.5 0 0 1 0-1H12z"/>
    </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.nombre}</td>
              <td className="p-2">S/ {p.precio}</td>
              <td className="p-2">{p.stock}</td>
              <td className="p-2 space-x-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => setProductoEditarId(p.id)}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(p.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal flotante para editar producto */}
      {productoEditarId && (
        <Modal onClose={() => setProductoEditarId(null)}>
          <EditProducto
            productoId={productoEditarId}
            onSuccess={() => {
              setProductoEditarId(null);
              fetchProductos(); // Refresca la lista al guardar/cancelar
            }}
          />
        </Modal>
      )}

      {/* Modal flotante de confirmación de eliminación */}
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
    </div>
  );
}