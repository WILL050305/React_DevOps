import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductSlider() {
  const [productos, setProductos] = useState([]);
  const [page, setPage] = useState(0);
  const [leftVisibleOnce, setLeftVisibleOnce] = useState(false);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductosDestacados = async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('destacado', true);

      if (error) {
        console.error('Error al obtener productos:', error.message);
        return;
      }

      const productosConImagenes = await Promise.all(
        data.map(async (producto) => {
          const { data: imgData, error: imgError } = await supabase
            .storage
            .from('products')
            .createSignedUrl(producto.imagen_url, 3600); // 1 hora

          return {
            ...producto,
            imagen_firmada: imgError ? '' : imgData.signedUrl
          };
        })
      );

      setProductos(productosConImagenes);
    };

    fetchProductosDestacados();
  }, []);

  const totalPages = Math.ceil(productos.length / itemsPerPage);

  const handleNext = () => {
    const nextPage = (page + 1) % totalPages;
    setPage(nextPage);
    if (nextPage !== 0) setLeftVisibleOnce(true);
  };

  const handlePrev = () => {
    const prevPage = (page - 1 + totalPages) % totalPages;
    setPage(prevPage);
    if (prevPage !== 0) setLeftVisibleOnce(true);
  };

  const getProductosActuales = () =>
    productos.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="relative bg-white py-10 px-4 md:px-12">
      <h2 className="text-2xl font-semibold mb-6">Productos Destacados</h2>

      {/* Flecha izquierda */}
      {(page !== 0 || leftVisibleOnce) && (
        <button
          onClick={handlePrev}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 z-20 bg-white border rounded-full p-2 shadow hover:scale-110 transition duration-200"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Flecha derecha */}
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 z-20 bg-white border rounded-full p-2 shadow hover:scale-110 transition duration-200"
      >
        <ChevronRight size={24} />
      </button>

      {/* Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {getProductosActuales().map((producto) => {
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
              {/* Etiqueta superior sin número */}
              {tieneDescuento && (
                porcentajeDescuento >= 50 ? (
                  <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs py-2 px-4 font-bold text-center z-10">
                    💧 LIQUIDACIÓN
                  </div>
                ) : (
                  <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-xs py-2 px-4 font-bold text-center z-10">
                    🔥 OFERTA
                  </div>
                )
              )}

              {/* Imagen */}
              <img
                src={producto.imagen_firmada}
                alt={producto.nombre}
                className="w-full h-96 object-cover object-top transition-transform duration-300 hover:scale-105"
              />

              {/* Info */}
              <div className="p-4 text-center">
                <h3 className="font-semibold text-sm mb-2">{producto.nombre}</h3>

                {/* Precios */}
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
                  <p className="text-lg font-bold text-black mt-2">
                    S/. {producto.precio}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
