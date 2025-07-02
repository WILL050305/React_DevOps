import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [detallesPorVenta, setDetallesPorVenta] = useState({});
  const [loading, setLoading] = useState(true);

  // Función para obtener la URL firmada de una imagen
  const obtenerURLFirmada = async (path) => {
    const { data, error } = await supabase.storage.from('products').createSignedUrl(path, 60 * 60);
    if (error) {
      console.error('Error al generar URL firmada:', error);
      return null;
    }
    return data.signedUrl;
  };

  // Redondeo personalizado
  const redondear = (valor) => {
    const entero = Math.floor(valor);
    const decimal = Math.round((valor - entero) * 100);
    const nuevoDecimal = decimal % 10 <= 4 ? 0 : 99;
    return nuevoDecimal === 0
      ? `S/. ${entero}.00`
      : `S/. ${entero}.${nuevoDecimal}`;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setUser(userData.user);

      const { data: ventasData, error: ventasError } = await supabase
        .from('ventas')
        .select('*')
        .eq('id_usuario', userData.user.id)
        .order('fecha', { ascending: false });

      if (ventasError) {
        console.error('Error al obtener ventas:', ventasError);
        return;
      }
      setVentas(ventasData);

      const detallesTemp = {};
      for (const venta of ventasData) {
        const { data: detalles, error: detalleError } = await supabase
          .from('ventas_detalle')
          .select(`
            *,
            productos (nombre, imagen_url),
            tallas (nombre)
          `)
          .eq('id_venta', venta.id);

        if (detalleError) {
          console.error('Error al obtener detalles:', detalleError);
          continue;
        }

        // Reemplazar imagen_url por la URL firmada
        for (const detalle of detalles) {
          if (detalle.productos?.imagen_url) {
            const urlFirmada = await obtenerURLFirmada(detalle.productos.imagen_url);
            detalle.productos.imagen_url_firmada = urlFirmada;
          }
        }

        detallesTemp[venta.id] = detalles;
      }

      setDetallesPorVenta(detallesTemp);
      setLoading(false);
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium">Cargando historial de compras...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 mt-20">
      <h1 className="text-2xl font-bold mb-6">Historial de Compras</h1>
      {ventas.length === 0 ? (
        <p className="text-gray-600">No has realizado ninguna compra aún.</p>
      ) : (
        ventas.map((venta) => {
          const detalles = detallesPorVenta[venta.id] || [];
          const total = detalles.reduce(
            (acc, d) => acc + d.cantidad * parseFloat(d.precio_unitario),
            0
          );
          return (
            <div key={venta.id} className="mb-8 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">
                <strong>Fecha de compra:</strong> {new Date(venta.fecha).toLocaleString()}
              </p>
              {detalles.length > 0 ? (
                <>
                  <table className="w-full text-sm text-left mt-3">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2">Producto</th>
                        <th className="py-2 text-center">Talla</th>
                        <th className="py-2 text-center">Cantidad</th>
                        <th className="py-2 text-right">Precio Unitario</th>
                        <th className="py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((detalle, i) => {
                        const subtotal = detalle.cantidad * parseFloat(detalle.precio_unitario);
                        return (
                          <tr key={i} className="border-b">
                            <td className="py-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={detalle.productos?.imagen_url_firmada}
                                  alt={detalle.productos?.nombre}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <span className="truncate">{detalle.productos?.nombre}</span>
                              </div>
                            </td>
                            <td className="text-center py-2">{detalle.tallas?.nombre || '-'}</td>
                            <td className="text-center py-2">{detalle.cantidad}</td>
                            <td className="text-right py-2">
                              S/. {Number(detalle.precio_unitario).toFixed(2)}
                            </td>
                            <td className="text-right py-2 font-semibold">
                              {redondear(subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="text-right mt-3 font-bold text-lg">
                    Total: {redondear(total)}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No hay detalles para esta compra.</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
