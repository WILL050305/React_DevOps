import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ResumenAdmin() {
  const [resumen, setResumen] = useState({
    totalDia: 0,
    productosVendidos: 0,
    productosTotales: 0,
  });

  const [datosGrafico, setDatosGrafico] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const formatoSoles = (valor) =>
    'S/. ' +
    Math.floor(valor).toString() +
    '.' +
    (valor % 10 <= 4 ? '00' : '99');

  const obtenerResumen = async () => {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const { data: ventasHoy } = await supabase
      .from('ventas')
      .select('id, fecha')
      .gte('fecha', inicioDia.toISOString());

    const idsVentasHoy = ventasHoy.map((v) => v.id);

    let totalDia = 0;
    let productosVendidos = 0;

    if (idsVentasHoy.length > 0) {
      const { data: detallesHoy } = await supabase
        .from('ventas_detalle')
        .select('cantidad, precio_unitario')
        .in('id_venta', idsVentasHoy);

      detallesHoy.forEach((d) => {
        totalDia += d.cantidad * parseFloat(d.precio_unitario);
        productosVendidos += d.cantidad;
      });
    }

    const { count } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true });

    setResumen({
      totalDia,
      productosVendidos,
      productosTotales: count || 0,
    });
  };

  const obtenerDatosGrafico = async () => {
    let query = supabase
      .from('ventas')
      .select('id, fecha, ventas_detalle(cantidad, precio_unitario)');

    if (fechaInicio) query = query.gte('fecha', fechaInicio);
    if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      query = query.lte('fecha', fin.toISOString());
    }

    const { data, error } = await query;
    if (error) return console.error(error);

    const agrupado = {};

    data.forEach((venta) => {
      const fecha = new Date(venta.fecha);
      const dia = fecha.toLocaleDateString('es-PE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      });

      if (!agrupado[dia]) {
        agrupado[dia] = {
          dia,
          vendidos: 0,
          recaudado: 0,
        };
      }

      venta.ventas_detalle.forEach((detalle) => {
        agrupado[dia].vendidos += detalle.cantidad;
        agrupado[dia].recaudado += detalle.cantidad * parseFloat(detalle.precio_unitario);
      });
    });

    setDatosGrafico(Object.values(agrupado));
  };

  useEffect(() => {
    obtenerResumen();
    obtenerDatosGrafico();
    const interval = setInterval(() => {
      obtenerResumen();
      obtenerDatosGrafico();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Calcular ticks personalizados para YAxis
  const calcularTicks = () => {
    const max = Math.max(...datosGrafico.map((d) => d.recaudado), 0);

    if (max <= 700) {
      const ticks = [];
      for (let i = 0; i <= 700; i += 100) {
        ticks.push(i);
      }
      return ticks;
    } else {
      const ticks = [];
      for (let i = 0; i <= max + 700; i += 700) {
        ticks.push(i);
      }
      return ticks;
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">


      {/* Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white text-center mb-8">
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

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Desde:</label>
          <input
            type="date"
            className="border px-3 py-1 rounded"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hasta:</label>
          <input
            type="date"
            className="border px-3 py-1 rounded"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
        <button
          onClick={obtenerDatosGrafico}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Filtrar Gráfico
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-bold mb-4">Ventas por Día</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosGrafico} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="dia" />
            <YAxis
              ticks={calcularTicks()}
              domain={[0, 'dataMax']}
              tickFormatter={(value) => `S/. ${value}`}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="vendidos" fill="#3B82F6" name="Productos Vendidos" />
            <Bar dataKey="recaudado" fill="#10B981" name="Total Ganado" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
