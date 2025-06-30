import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ producto }) {
  const navigate = useNavigate();

  const tieneDescuento =
    producto.precio_rebajado &&
    parseFloat(producto.precio_rebajado) < parseFloat(producto.precio);

  const porcentajeDescuento = tieneDescuento
    ? Math.floor(
        ((producto.precio - producto.precio_rebajado) / producto.precio) * 100
      )
    : 0;

  return (
    <div
      key={producto.id}
      className="relative bg-gray-100 rounded shadow overflow-hidden hover:shadow-xl transition-transform duration-200 cursor-pointer"
      onClick={() => navigate(`/producto/${producto.id}`)}
    >
      {/* Etiquetas */}
      {tieneDescuento ? (
        porcentajeDescuento >= 50 ? (
          <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs py-2 px-4 font-bold text-center z-10">
            💧 LIQUIDACIÓN
          </div>
        ) : (
          <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-xs py-2 px-4 font-bold text-center z-10">
            🔥 OFERTA
          </div>
        )
      ) : (
        <div className="absolute top-0 left-0 w-full bg-green-600 text-white text-xs py-2 px-4 font-bold text-center z-10">
          🆕 NOVEDAD
        </div>
      )}

      {/* Imagen */}
      <img
        src={producto.imagenUrl}
        alt={producto.nombre}
        className="w-full h-96 object-cover object-top transition-transform duration-300 hover:scale-105"
      />

      {/* Info */}
      <div className="p-4 text-center">
        <h3 className="font-semibold text-sm mb-2">{producto.nombre}</h3>

        {tieneDescuento ? (
          <div className="flex justify-center items-center gap-3 mt-2">
            <span className="text-sm text-gray-400 line-through decoration-2 decoration-gray-400">
              S/. {producto.precio}
            </span>
            <span className="text-lg font-bold text-black">
              S/. {producto.precio_rebajado}
            </span>
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
              -{porcentajeDescuento}%
            </span>
          </div>
        ) : (
          <p className="text-lg font-bold text-black mt-2">S/. {producto.precio}</p>
        )}
      </div>
    </div>
  );
}
