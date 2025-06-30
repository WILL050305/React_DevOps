import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function ProductView() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [imagenUrl, setImagenUrl] = useState('');
  const [nombreTemporada, setNombreTemporada] = useState('');
  const [tallas, setTallas] = useState([]);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null); // será el objeto { id_talla, nombre, stock }
  const [stockDisponible, setStockDisponible] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const fetchProducto = async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setProducto(data);

      const { data: imgData } = await supabase.storage
        .from('products')
        .createSignedUrl(data.imagen_url, 3600);

      setImagenUrl(imgData.signedUrl);

      // Obtener nombre de temporada
      const { data: temporadaData, error: temporadaError } = await supabase
        .from('temporadas')
        .select('nombre')
        .eq('id_temporada', data.id_temporada)
        .single();

      if (!temporadaError) {
        setNombreTemporada(temporadaData.nombre);
      }

      // Obtener tallas disponibles solo para este producto, con stock y nombre
      const { data: tallasStockData, error: stockError } = await supabase
        .from('producto_talla_stock')
        .select('id_talla, stock, tallas (nombre)')
        .eq('id_producto', id);

      if (!stockError) {
        const tallasConNombre = tallasStockData.map(item => ({
          id_talla: item.id_talla,
          nombre: item.tallas.nombre,
          stock: item.stock
        }));
        setTallas(tallasConNombre);
      }
    };

    fetchProducto();
  }, [id]);

  // Función manejadora para Comprar Ahora
  const handleComprarAhora = () => {
    if (!tallaSeleccionada) {
      alert("Seleccione al menos una talla para continuar.");
      return;
    }

    if (cantidad > stockDisponible) {
      alert("Cantidad excede el stock disponible.");
      return;
    }

    // Aquí iría tu lógica de compra
    alert("Compra procesada (simulada).");
  };

  // Función manejadora para Agregar al Carrito
  const handleAgregarAlCarrito = () => {
    if (!tallaSeleccionada) return alert("Seleccione una talla");
    
    const nuevoItem = {
      id: producto.id,
      nombre: producto.nombre,
      imagen: imagenUrl,
      talla: tallaSeleccionada,
      cantidad: parseInt(cantidad),
      precio: producto.precio_rebajado ? parseFloat(producto.precio_rebajado) : parseFloat(producto.precio),
      stock_disponible: stockDisponible // 👈 Añadido el stock de la talla seleccionada
    };

    const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];

    // Si ya existe el mismo producto con misma talla, suma la cantidad
    const indexExistente = carritoActual.findIndex(item =>
      item.id === nuevoItem.id && item.talla.id_talla === nuevoItem.talla.id_talla
    );

    if (indexExistente !== -1) {
      carritoActual[indexExistente].cantidad += nuevoItem.cantidad;
    } else {
      carritoActual.push(nuevoItem);
    }

    localStorage.setItem('carrito', JSON.stringify(carritoActual));

    // Mostrar notificación y abrir desplegable
    window.dispatchEvent(new CustomEvent('carrito:actualizado', {
      detail: {
        mensaje: `"${producto.nombre}" se ha agregado al carrito`,
        carrito: carritoActual
      }
    }));
  };

  if (!producto) return <div className="p-6">Cargando producto...</div>;

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-[80px] md:pt-[100px] px-4 md:px-10 max-w-6xl mx-auto w-full">
        <nav className="text-sm text-gray-600 mb-3">
          <Link to="/" className="hover:underline text-black">Home</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-500">{producto.nombre}</span>
        </nav>
      </div>

      {/* Contenido del producto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-4 md:p-10 max-w-6xl mx-auto">
        {/* Imagen */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm aspect-[3/4] relative">
            {/* Etiqueta superior según condición */}
            {(() => {
              let tieneDescuento = false;
              let porcentajeDescuento = 0;
              if (producto.precio_rebajado) {
                const precio = parseFloat(producto.precio);
                const rebajado = parseFloat(producto.precio_rebajado);
                tieneDescuento = rebajado < precio;
                porcentajeDescuento = Math.floor(((precio - rebajado) / precio) * 100);
              }
              return tieneDescuento ? (
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
              );
            })()}
            <img
              src={imagenUrl}
              alt={producto.nombre}
              className="w-full h-full object-cover rounded shadow"
            />
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{producto.nombre}</h1>

            {/* Etiquetas condicionales */}
            {producto.precio_rebajado ? (
              (() => {
                const precio = parseFloat(producto.precio);
                const rebajado = parseFloat(producto.precio_rebajado);
                const descuento = Math.floor(((precio - rebajado) / precio) * 100);

                return descuento >= 50 ? (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    💧 Liquidación -{descuento}%
                  </span>
                ) : (
                  <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    🔥 Oferta -{descuento}%
                  </span>
                );
              })()
            ) : (
              <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                🆕 Novedad
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">Marca: {producto.marca}</p>
          <p className="text-gray-600 text-sm mb-4">Temporada: {nombreTemporada}</p>

          {/* Precio */}
          {producto.precio_rebajado ? (
            (() => {
              const precio = parseFloat(producto.precio);
              const rebajado = parseFloat(producto.precio_rebajado);
              const porcentajeDescuento = Math.floor(((precio - rebajado) / precio) * 100);
              return (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-black">
                    S/. {producto.precio_rebajado}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    S/. {producto.precio}
                  </span>
                  <span className="text-xs font-semibold text-white bg-red-600 px-2 py-0.5 rounded">
                    -{porcentajeDescuento}%
                  </span>
                </div>
              );
            })()
          ) : (
            <div className="mb-4 text-xl font-bold text-black">S/. {producto.precio}</div>
          )}

          {/* Tallas */}
          <div className="mb-4">
            <label className="font-semibold">Talla:</label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {tallas.map(talla => (
                <button
                  key={talla.id_talla}
                  onClick={() => {
                    setTallaSeleccionada(talla);
                    setStockDisponible(talla.stock); // 👈 usar stock ya cargado
                  }}
                  className={`border px-3 py-1 rounded transition ${
                    tallaSeleccionada?.id_talla === talla.id_talla
                      ? 'bg-black text-white'
                      : 'hover:bg-black hover:text-white'
                  }`}
                >
                  {talla.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad */}
          <div className="mb-6">
            <label className="font-semibold">Cantidad:</label>
            <input
              type="number"
              value={cantidad}
              min={1}
              max={stockDisponible ?? undefined}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setCantidad(isNaN(value) ? 1 : value);
              }}
              className="w-16 ml-3 border rounded px-2 py-1"
            />

            {tallaSeleccionada ? (
              <div className="mt-2 text-sm text-gray-700">
                {stockDisponible !== null ? (
                  <span>Stock disponible para la talla <strong>{tallaSeleccionada.nombre}</strong>: <strong>{stockDisponible}</strong></span>
                ) : (
                  <span className="text-red-500">No se pudo obtener el stock</span>
                )}
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">
                Seleccione una talla para consultar el stock
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={handleComprarAhora}
              className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800"
            >
              Comprar Ahora
            </button>

            <button
              onClick={handleAgregarAlCarrito}
              className="border px-5 py-2 rounded hover:bg-gray-100"
            >
              Agregar al Carrito
            </button>
          </div>

          {/* Descripción */}
          <div className="mt-8">
            <h2 className="font-semibold mb-2">Descripción del producto</h2>
            <p className="text-gray-700">{producto.descripcion}</p>
          </div>
        </div>
      </div>

      {/* Productos sugeridos */}
      <div className="max-w-6xl mx-auto px-4 md:px-10 mt-8">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Productos que te podrían interesar</h2>
        {/* Aquí irán los productos sugeridos en el futuro */}
      </div>
    </>
  );
}
