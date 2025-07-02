import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ResumenAdmin() {
  const [resumen, setResumen] = useState({
    totalDia: 0,
    productosVendidos: 0,
    productosTotales: 0,
  });

  useEffect(() => {
    const getInicioUTCDeHoy = () => {
      const now = new Date();
      return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)).toISOString();
    };

    const obtenerResumen = async () => {
      const inicioDia = getInicioUTCDeHoy();

      // 1. Ventas del día
      const { data: ventasHoy, error: errorVentas } = await supabase
        .from('ventas')
        .select('id, fecha')
        .gte('fecha', inicioDia);

      if (errorVentas) console.error(errorVentas);

      const idsVentasHoy = ventasHoy.map(v => v.id);
      let totalDia = 0;
      let productosVendidos = 0;

      if (idsVentasHoy.length > 0) {
        const { data: detallesHoy, error: errorDetalles } = await supabase
          .from('ventas_detalle')
          .select('cantidad, precio_unitario')
          .in('id_venta', idsVentasHoy);

        if (errorDetalles) console.error(errorDetalles);

        detallesHoy.forEach(d => {
          totalDia += d.cantidad * parseFloat(d.precio_unitario);
          productosVendidos += d.cantidad;
        });
      }

      // 2. Total de stock en producto_talla_stock
      const { data: stockData, error: errorStock } = await supabase
        .from('producto_talla_stock')
        .select('stock');

      if (errorStock) console.error(errorStock);

      const productosTotales = stockData
        ? stockData.reduce((acc, item) => acc + item.stock, 0)
        : 0;

      setResumen({
        totalDia,
        productosVendidos,
        productosTotales
      });
    };

    obtenerResumen();
    const interval = setInterval(obtenerResumen, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatoSoles = (valor) =>
    'S/. ' +
    Math.floor(valor).toString() +
    '.' +
    (valor % 10 <= 4 ? '00' : '99');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white text-center">
      <div className="bg-green-500 rounded-xl shadow p-6">
        <h3 className="text-lg font-bold">Total Recaudado Hoy</h3>
        <p className="text-2xl mt-2">{formatoSoles(resumen.totalDia)}</p>
      </div>
      <div className="bg-blue-500 rounded-xl shadow p-6">
        <h3 className="text-lg font-bold">Productos Vendidos Hoy</h3>
        <p className="text-2xl mt-2">{resumen.productosVendidos}</p>
      </div>
      <div className="bg-purple-500 rounded-xl shadow p-6">
        <h3 className="text-lg font-bold">Productos Totales</h3>
        <p className="text-2xl mt-2">{resumen.productosTotales}</p>
      </div>
    </div>
  );
}
