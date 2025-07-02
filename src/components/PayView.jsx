import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PayView() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState([]);
  const [carritoOriginal, setCarritoOriginal] = useState([]);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const paypalRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
      } else {
        navigate('/auth');
      }
      setLoading(false);
    };

    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    setCarrito(carritoGuardado);

    getUser();
  }, [navigate]);

  const ajustarPrecio = (precio) => {
    const entero = Math.floor(precio);
    const centavos = Math.round((precio - entero) * 100);
    if (centavos % 10 <= 4) {
      return (entero + Math.floor(centavos / 10) / 10).toFixed(2);
    } else {
      return (entero + Math.floor(centavos / 10) / 10 + 0.09).toFixed(2);
    }
  };

  const carritoParaMostrar = pagoExitoso ? carritoOriginal : carrito;
  const cantidadProductos = carritoParaMostrar.reduce((acc, item) => acc + item.cantidad, 0);
  const totalAPagarSinAjuste = carritoParaMostrar.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalAPagar = Number(ajustarPrecio(totalAPagarSinAjuste).toString());

  useEffect(() => {
    if (user && carritoParaMostrar.length > 0 && window.paypal && paypalRef.current) {
      // Limpiar el contenedor solo si existe
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }

      const paypalButtonsInstance = window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: totalAPagar.toString() }
            }]
          });
        },
        onApprove: async (data, actions) => {
          return actions.order.capture().then(async details => {
            console.log('Detalles de la compra:', details);

            // Registro en la tabla 'ventas'
            const { data: venta, error: errorVenta } = await supabase
              .from('ventas')
              .insert([{ id_usuario: user.id }])
              .select()
              .single();

            if (errorVenta) {
              console.error('Error al registrar la venta:', errorVenta);
              alert('Error al registrar la venta');
              return;
            }

            const idVenta = venta.id; // ✅ campo correcto
            // Registro en la tabla 'ventas_detalle'
            const detalles = carrito.map(item => ({
              id_venta: idVenta,
              id_producto: item.id, // ✅ ahora sí
              id_talla: item.talla && typeof item.talla === 'object' ? item.talla.id_talla : item.talla || null,
              cantidad: item.cantidad,
              precio_unitario: item.precio
            }));

            const detallesValidos = detalles.filter(d =>
              d.id_producto &&
              d.cantidad > 0 &&
              d.precio_unitario > 0 &&
              d.id_talla !== null && d.id_talla !== undefined
            );

            if (detallesValidos.length === 0) {
              alert('Error: No hay detalles válidos para registrar.');
              return;
            }

            const { error: errorDetalle } = await supabase
              .from('ventas_detalle')
              .insert(detallesValidos);

            if (errorDetalle) {
              console.error('Error al registrar el detalle de la venta:', errorDetalle);
              alert('Error al registrar el detalle de la venta');
              return;
            }

            // Reducir stock por cada producto
            for (const producto of carrito) {
              await supabase.rpc('reducir_stock', {
                p_id_producto: producto.id, // ✅
                p_id_talla: typeof producto.talla === 'object' ? producto.talla.id_talla : producto.talla,
                p_cantidad: producto.cantidad
              });
            }

            setCarritoOriginal([...carrito]);
            localStorage.removeItem('carrito');
            window.dispatchEvent(new CustomEvent('carrito:actualizado', {
              detail: {
                carrito: [],
                mensaje: 'Compra realizada. Carrito vaciado.',
                noAbrirDropdown: true
              }
            }));
            window.dispatchEvent(new CustomEvent('carrito:bloqueado'));
            setCarrito([]);
            setPagoExitoso(true);
          });
        },
        onError: (err) => {
          console.error('Error en PayPal: ', err);
          alert('Ocurrió un error al procesar el pago.');
        }
      });

      paypalButtonsInstance.render(paypalRef.current);

      // Limpieza segura
      return () => {
        if (paypalRef.current) {
          paypalRef.current.innerHTML = '';
        }
        try {
          paypalButtonsInstance.close?.();
        } catch (error) {
          console.warn('Error al limpiar PayPal:', error);
        }
      };
    }
  }, [user, carritoParaMostrar, totalAPagar]);

  const actualizarCantidad = (index, nuevaCantidad) => {
    const copia = [...carrito];
    const maxStock = copia[index].stock_disponible;

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

  useEffect(() => {
    if (pagoExitoso) {
      window.__pagoExitosoGlobal = true;
    } else {
      window.__pagoExitosoGlobal = false;
    }
  }, [pagoExitoso]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium">Cargando...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      {/* MODAL DE ÉXITO */}
      <AnimatePresence>
        {pagoExitoso && (
          <>
            {/* Overlay visual para bloquear el fondo */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
            <motion.div
              className="fixed inset-0 flex justify-center items-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center max-w-sm"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <CheckCircle className="text-green-500" size={64} />
                <h4 className="text-xl font-semibold mt-4 mb-2">¡Pago exitoso!</h4>
                <p className="mb-4">
                  Puede verificar su compra en <span className="font-semibold">Mis compras</span>.
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Ir a Mis compras
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Overlay visual adicional para bloquear el fondo tras pago exitoso */}
      {pagoExitoso && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}

      {/* CARRITO */}
      <div className={`max-w-5xl mx-auto p-4 pt-24 pl-[18px] ${pagoExitoso ? 'opacity-50 pointer-events-none' : ''}`}>
        {carritoParaMostrar.length > 0 ? (
          <>
            <h2 className="text-sm font-medium mb-4 truncate">
              El monitoreo del producto se enviará al correo <span className="font-bold">{user.email}</span>.
            </h2>

            <h3 className="text-lg font-medium mb-2">Total de productos: {cantidadProductos}</h3>

            <div className="overflow-x-auto">
              {/* Tabla del carrito */}
              <table className="w-full text-sm text-left border-collapse">
                <colgroup>
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "60px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "80px" }} />
                  <col style={{ width: "60px" }} />
                </colgroup>
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Producto</th>
                    <th className="py-2 text-center">Talla</th>
                    <th className="py-2 text-center">Cantidad</th>
                    <th className="py-2 text-right">Precio</th>
                    <th className="py-2 text-center">Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {carritoParaMostrar.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        <div className="flex items-center gap-3">
                          <img src={item.imagen} alt={item.nombre} className="w-14 h-14 object-cover rounded flex-shrink-0" />
                          <div className="font-medium text-sm min-w-0 truncate">{item.nombre}</div>
                        </div>
                      </td>
                      <td className="text-center py-2">
                        {typeof item.talla === 'object' ? item.talla.nombre : item.talla}
                      </td>
                      <td className="text-center py-2">
                        {!pagoExitoso ? (
                          <div className="flex items-center justify-center gap-2">
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
                              className="w-12 text-center border border-gray-300 rounded"
                            />
                            <button
                              onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                              disabled={item.cantidad >= item.stock_disponible}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="font-medium">{item.cantidad}</span>
                        )}
                      </td>
                      <td className="text-right font-semibold py-2">
                        S/. {ajustarPrecio(item.precio * item.cantidad)}
                      </td>
                      <td className="text-center py-2">
                        {!pagoExitoso && (
                          <button
                            onClick={() => eliminarDelCarrito(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-lg font-semibold text-right">
              Total a pagar: S/. {totalAPagar}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-4">Tu carrito está vacío</h3>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Continuar comprando
            </Link>
          </div>
        )}
      </div>

      {/* Métodos de pago siempre visibles */}
      <div className={`mt-6 text-center space-y-4 ${pagoExitoso ? 'opacity-50 pointer-events-none' : ''}`}>
        <h3 className="text-lg font-semibold mb-4">Elige un método de pago</h3>
        <div className="flex justify-center items-center">
          {/* Botón de PayPal */}
          <div ref={paypalRef} className="w-[300px]" />
        </div>
      </div>
    </>
  );
}
