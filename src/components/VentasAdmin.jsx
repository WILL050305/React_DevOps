import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function VentasAdmin() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const redondear = (valor) => {
    const entero = Math.floor(valor);
    const decimal = Math.round((valor - entero) * 100);
    const nuevoDecimal = decimal % 10 <= 4 ? 0 : 99;
    return nuevoDecimal === 0
      ? `S/. ${entero}.00`
      : `S/. ${entero}.${nuevoDecimal}`;
  };

  const fetchVentas = async () => {
    setLoading(true);

    let query = supabase
      .from('ventas')
      .select(`
        id,
        fecha,
        usuarios:usuarios!fk_ventas_usuario (
          nombre,
          apellido,
          correo
        ),
        ventas_detalle (
          cantidad,
          precio_unitario,
          productos (
            nombre
          ),
          tallas (
            nombre
          )
        )
      `)
      .order('fecha', { ascending: false });

    // Agrega filtros por fecha si están definidos
    if (fechaInicio) {
      query = query.gte('fecha', fechaInicio);
    }
    if (fechaFin) {
      // Para incluir el día completo
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      query = query.lte('fecha', fin.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener ventas:', error);
      setLoading(false);
      return;
    }

    setVentas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVentas(); // Carga inicial
    // eslint-disable-next-line
  }, []);

  // Exportar a Excel
  const exportarExcel = () => {
    const datosExportar = [];

    ventas.forEach((venta) => {
      (venta.ventas_detalle || []).forEach((detalle) => {
        datosExportar.push({
          Cliente: `${venta.usuarios?.nombre || '—'} ${venta.usuarios?.apellido || ''}`,
          Correo: venta.usuarios?.correo || '—',
          Producto: detalle.productos?.nombre || '—',
          Talla: detalle.tallas?.nombre || '—',
          Cantidad: detalle.cantidad,
          'Precio Unitario': parseFloat(detalle.precio_unitario).toFixed(2),
          Total: (detalle.cantidad * parseFloat(detalle.precio_unitario)).toFixed(2),
          Fecha: new Date(venta.fecha).toLocaleString(), // añade la fecha formateada
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'ventas.xlsx');
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Historial de Ventas</h2>

      {/* Filtro por fechas */}
      <div className="flex items-end gap-4 mb-6 flex-wrap">
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
        <div className="flex gap-2">
          <button
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            onClick={fetchVentas}
          >
            Filtrar
          </button>
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            onClick={() => {
              setFechaInicio('');
              setFechaFin('');
              fetchVentas();
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Botón exportar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={exportarExcel}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded"
        >
          Exportar a Excel
        </button>
      </div>

      {loading ? (
        <p className="text-center text-lg font-medium py-8">Cargando ventas...</p>
      ) : ventas.length === 0 ? (
        <p className="text-gray-600">No hay ventas registradas.</p>
      ) : (
        ventas.map((venta) => {
          const detalles = venta.ventas_detalle || [];
          const total = detalles.reduce(
            (acc, d) => acc + d.cantidad * parseFloat(d.precio_unitario),
            0
          );

          return (
            <div key={venta.id} className="mb-6 border rounded-lg p-4 shadow-sm bg-white">
              <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                <div>
                  <div><strong>Cliente:</strong> {venta.usuarios?.nombre} {venta.usuarios?.apellido}</div>
                  <div><strong>Correo:</strong> {venta.usuarios?.correo || '-'}</div>
                </div>
                <span><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleString()}</span>
              </div>
              <table className="w-full text-sm text-left">
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
                        <td className="py-2">{detalle.productos?.nombre || '-'}</td>
                        <td className="text-center py-2">{detalle.tallas?.nombre || '-'}</td>
                        <td className="text-center py-2">{detalle.cantidad}</td>
                        <td className="text-right py-2">S/. {Number(detalle.precio_unitario).toFixed(2)}</td>
                        <td className="text-right py-2 font-semibold">{redondear(subtotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="text-right mt-2 font-bold text-lg">
                Total: {redondear(total)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
