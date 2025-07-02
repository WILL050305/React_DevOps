// Header.jsx
import { useState, useRef, useEffect } from 'react';
import { Menu, Search, User, ShoppingCart, X, Trash2 } from 'lucide-react';
import Drawer from './Drawer';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function Header() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState('');
  const [carrito, setCarrito] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('carrito')) || [];
    } catch {
      return [];
    }
  });
  const [carritoDropdownAbierto, setCarritoDropdownAbierto] = useState(false);
  const [confirmarIndex, setConfirmarIndex] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [alertasStock, setAlertasStock] = useState([]); // ahora cada alerta tiene campo visible
  const menuRef = useRef();
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener usuario actual
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Cerrar menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar dropdown del carrito al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        // Si está abierto el modal de confirmación o estás haciendo clic en un botón relacionado, no cerrar
        const isDeleteButton = e.target.closest('.btn-eliminar');
        if (!mostrarConfirmacion && !isDeleteButton) {
          setCarritoDropdownAbierto(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [carritoDropdownAbierto, mostrarConfirmacion]);

  const handleLogout = async () => {
    setShowMenu(false);
    setShowLogoutOverlay(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      setShowLogoutOverlay(false);
      navigate('/');
    }, 1000);
  };

  const mostrarNotificacion = (texto) => {
    setMensajeCarrito(texto);
    setTimeout(() => {
      setMensajeCarrito('');
    }, 5000);
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    const copia = [...carrito];
    const maxStock = copia[index].stock_disponible;

    // Si se ingresa un número inválido o supera el stock
    if (isNaN(nuevaCantidad) || nuevaCantidad < 1 || nuevaCantidad > maxStock) return;

    copia[index].cantidad = nuevaCantidad;
    setCarrito(copia);
    localStorage.setItem('carrito', JSON.stringify(copia));
  };

  const eliminarDelCarrito = (index) => {
    const copia = [...carrito];
    copia.splice(index, 1);
    setCarrito(copia);
    localStorage.setItem('carrito', JSON.stringify(copia));
  };

  const confirmarEliminacion = (index) => {
    setConfirmarIndex(index);
    setMostrarConfirmacion(true);
  };

  const eliminarConfirmado = () => {
    eliminarDelCarrito(confirmarIndex);
    setMostrarConfirmacion(false);
    setConfirmarIndex(null);
  };

  const cancelarEliminacion = () => {
    setMostrarConfirmacion(false);
    setConfirmarIndex(null);
  };

  useEffect(() => {
    const manejarActualizacionCarrito = (event) => {
      const { mensaje, carrito, noAbrirDropdown } = event.detail;
      setCarrito(carrito);

      // Si el carrito está vacío, siempre cerrar el dropdown
      if (carrito.length === 0) {
        setCarritoDropdownAbierto(false);
      } else if (!noAbrirDropdown) {
        setCarritoDropdownAbierto(true);
      }

      mostrarNotificacion(mensaje);
    };

    window.addEventListener('carrito:actualizado', manejarActualizacionCarrito);

    return () => {
      window.removeEventListener('carrito:actualizado', manejarActualizacionCarrito);
    };
  }, []);

  // Función para mostrar alertas de stock máximo
  const mostrarAlertaStock = (nombre, talla) => {
    const id = Date.now();
    const nueva = {
      id,
      mensaje: `Stock máximo alcanzado para ${nombre} - Talla ${talla}`,
      visible: true,
    };

    setAlertasStock(prev => [...prev, nueva]);

    // Después de 2s, empieza animación de salida
    setTimeout(() => {
      setAlertasStock(prev =>
        prev.map(a => (a.id === id ? { ...a, visible: false } : a))
      );
    }, 2000); // Visibilidad total

    // Después de 2.3s, eliminar del DOM
    setTimeout(() => {
      setAlertasStock(prev => prev.filter(a => a.id !== id));
    }, 2300); // Incluye animación de salida
  };

  // Función para ajustar el precio a .0 o .9
  const ajustarPrecio = (precio) => {
    const entero = Math.floor(precio);
    const centavos = Math.round((precio - entero) * 100);
    if (centavos % 10 <= 4) {
      return (entero + Math.floor(centavos / 10) / 10).toFixed(2); // termina en .0
    } else {
      return (entero + Math.floor(centavos / 10) / 10 + 0.09).toFixed(2); // termina en .9
    }
  };

  // Calcula si hay algún producto en su stock máximo
  const hayStockMaximo = carrito.some(item => item.cantidad >= item.stock_disponible);

  const cantidadProductos = carrito.length;
  const totalAPagarSinAjuste = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalAPagar = ajustarPrecio(totalAPagarSinAjuste);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-black text-white w-full py-[14px] shadow-md z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setDrawerOpen((prev) => !prev)}
          className="group relative w-8 h-8 flex flex-col justify-center items-center focus:outline-none z-50"
          aria-label="Abrir menú"
        >
          <span className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ease-in-out ${isDrawerOpen ? 'rotate-45 top-4' : 'top-2 group-hover:w-7'}`}></span>
          <span className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ease-in-out ${isDrawerOpen ? 'opacity-0 left-4' : 'top-4 group-hover:w-7'}`}></span>
          <span className={`block absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ease-in-out ${isDrawerOpen ? '-rotate-45 top-4' : 'top-6 group-hover:w-7'}`}></span>
        </button>

        <h1
          onClick={() => navigate('/')}
          className="text-xl md:text-2xl font-semibold tracking-wide transition-all duration-300 cursor-pointer hover:scale-110 hover:text-gray-300"
        >
          VEREAU FOR MEN'S
        </h1>

        <div className="flex items-center gap-4 relative">
          <button
            onClick={() => navigate('/views/todos/0')}
            className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300"
          >
            <Search size={22} />
          </button>
          <div className="relative">
            <button
              onClick={user ? () => setShowMenu((v) => !v) : () => navigate('/auth')}
              className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300 flex items-center gap-2"
              style={user ? { opacity: 0.9 } : {}}
            >
              <User size={22} />
              {user && (
                <span className="ml-1 text-sm font-medium">
                  {user.user_metadata?.nombre || user.email}
                </span>
              )}
            </button>
            {user && showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50"
              >
                <button
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/profile'); // Cambiado a /profile
                  }}
                >
                  Mis compras
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 font-semibold"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => {
                setCarritoDropdownAbierto((prev) => !prev);
              }}
              className="transition-transform duration-200 hover:scale-125 hover:text-gray-300 focus:text-gray-300 relative"
            >
              <ShoppingCart size={22} />
            </button>
            {carritoDropdownAbierto && (
              <div
                ref={dropdownRef}
                className="absolute top-full mt-2 w-max max-w-[500px] bg-white rounded-lg shadow-lg z-[999] p-4 text-black"
                style={{ right: '0' }}
              >
                {/* contenido del carrito */}
                <h3 className="font-semibold mb-2">Carrito</h3>
                <ul className="max-h-[255px] overflow-y-auto pr-2">
                  {carrito.length === 0 ? (
                    <li className="text-center text-gray-500 py-8 px-4 text-sm leading-6">
                      Sin productos seleccionados.{" "}
                      <button
                        onClick={() => {
                          navigate('/');
                          setCarritoDropdownAbierto(false);
                        }}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Añada productos
                      </button>{" "}
                      por favor.
                    </li>
                  ) : (
                    carrito.map((item, index) => {
                      return (
                        <li key={index} className="flex items-center gap-2 border-b pb-2 mb-2 h-[85px] text-black text-sm">
                          {/* contenido del producto */}
                          {/* Imagen */}
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="w-14 h-14 object-cover rounded"
                          />
                          {/* Nombre */}
                          <div className="flex-1 max-w-[180px] break-words font-medium text-sm leading-5">
                            {item.nombre}
                          </div>
                          {/* Talla */}
                          <div className="w-14 text-center">
                            {typeof item.talla === 'object' ? item.talla.nombre : item.talla}
                          </div>
                          {/* Cantidad */}
                          <div className="flex items-center gap-1 w-24 justify-center">
                            <button
                              onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                              disabled={item.cantidad <= 1}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stock_disponible}
                              value={item.cantidad}
                              onChange={(e) => {
                                const nuevaCantidad = parseInt(e.target.value, 10);
                                if (nuevaCantidad <= item.stock_disponible) {
                                  actualizarCantidad(index, nuevaCantidad);
                                }
                              }}
                              className="w-10 text-center border border-gray-300 rounded"
                            />
                            <button
                              onClick={() => {
                                if (item.cantidad < item.stock_disponible) {
                                  actualizarCantidad(index, item.cantidad + 1);
                                } else {
                                  mostrarAlertaStock(item.nombre, typeof item.talla === 'object' ? item.talla.nombre : item.talla);
                                }
                              }}
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                          {/* Precio */}
                          <div className="w-24 text-right font-semibold whitespace-nowrap">
                            S/. {ajustarPrecio(item.precio * item.cantidad)}
                          </div>
                          {/* Eliminar */}
                          <div className="w-20 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProductoAEliminar(index);
                                setMostrarConfirmacion(true);
                              }}
                              className="btn-eliminar text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
                {carrito.length > 0 && (
                  <div className="mt-3 pt-3 border-t flex flex-col gap-2">
                    <button
                      className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
                      onClick={() => {
                        if (user) {
                          setCarritoDropdownAbierto(false); // 🔴 Cierra el dropdown al ir a PayView
                          navigate('/payview');
                        } else {
                          navigate('/auth');
                        }
                      }}
                    >
                      Comprar {cantidadProductos} producto{cantidadProductos > 1 ? 's' : ''} por S/. {totalAPagar}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      {isDrawerOpen && <Drawer onClose={() => setDrawerOpen(false)} />}

      {showLogoutOverlay && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-[9999] transition-opacity">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-black mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-xl font-semibold text-black">Cerrando sesión...</span>
          </div>
        </div>
      )}
      {mensajeCarrito && (
        <div className="fixed bottom-4 left-4 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg z-[999] text-sm font-medium animate-fade-in-out">
          {mensajeCarrito}
        </div>
      )}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[320px] text-center">
            <h2 className="text-lg font-semibold mb-4">¿Eliminar producto?</h2>
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro que quieres eliminar este producto del carrito?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  eliminarDelCarrito(productoAEliminar);
                  setMostrarConfirmacion(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mostrar alertas de stock máximo */}
      {alertasStock.length > 0 && (
        <div className="fixed top-20 left-4 z-[9999] space-y-2">
          {alertasStock.map(alerta => (
            <div
              key={alerta.id}
              className={`
                bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded shadow text-sm w-max max-w-xs transition-all duration-300 ease-in-out
                ${alerta.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
              `}
            >
              {alerta.mensaje}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default Header;