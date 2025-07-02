import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ChevronRight } from 'lucide-react';

export default function ViewsSelected() {
  const { tipo, id } = useParams();
  const [productos, setProductos] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [filtroMarca, setFiltroMarca] = useState([]);
  const [filtroPrecio, setFiltroPrecio] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState([]);
  const [filtroTemporada, setFiltroTemporada] = useState([]);
  const [mostrarMarcas, setMostrarMarcas] = useState(false);
  const [mostrarPrecios, setMostrarPrecios] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [mostrarTemporadas, setMostrarTemporadas] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatos = async () => {
      let productosData = [];
      let error = null;

      if (tipo === 'todos') {
        const result = await supabase.from('productos').select('*');
        productosData = result.data;
        error = result.error;

        // Cargar categorías y temporadas solo para "todos"
        const { data: catData } = await supabase.from('categorias').select('*');
        const { data: tempData } = await supabase.from('temporadas').select('*');
        setCategorias(catData || []);
        setTemporadas(tempData || []);
      } else {
        const filtro = tipo === 'categoria' ? 'categoria_id' : 'id_temporada';
        const result = await supabase
          .from('productos')
          .select('*')
          .eq(filtro, id);
        productosData = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error al cargar productos:', error.message);
        return;
      }

      const productosConImagenes = await Promise.all(
        productosData.map(async (producto) => {
          const { data: signedImage } = await supabase
            .storage
            .from('products')
            .createSignedUrl(producto.imagen_url, 3600);

          return {
            ...producto,
            imagen_firmada: signedImage?.signedUrl || '',
          };
        })
      );

      setProductos(productosConImagenes);

      if (tipo === 'todos') {
        setTitulo('Todos los productos');
      } else {
        const { data: meta } = await supabase
          .from(tipo === 'categoria' ? 'categorias' : 'temporadas')
          .select('nombre')
          .eq(tipo === 'categoria' ? 'id_categoria' : 'id_temporada', id)
          .single();

        setTitulo(meta?.nombre || 'Vista seleccionada');
      }

      const { data: marcasData } = await supabase.from('marcas').select('*');
      setMarcas(marcasData || []);
    };

    fetchDatos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tipo, id]);

  // Filtrado por marca, precio, categoría y temporada
  const productosFiltrados = productos.filter((producto) => {
    const cumpleMarca = filtroMarca.length === 0 || filtroMarca.includes(producto.marca);
    const precioBase = producto.precio_rebajado || producto.precio;
    const cumplePrecio = !filtroPrecio || (precioBase >= filtroPrecio.min && precioBase <= filtroPrecio.max);
    const cumpleCategoria = filtroCategoria.length === 0 || filtroCategoria.includes(producto.categoria_id);
    const cumpleTemporada = filtroTemporada.length === 0 || filtroTemporada.includes(producto.id_temporada);

    return cumpleMarca && cumplePrecio && cumpleCategoria && cumpleTemporada;
  });

  return (
    <div className="pt-[80px] md:pt-[100px] max-w-7xl mx-auto px-2 py-10">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filtros */}
        <aside className="w-full md:w-[18%]">
          <div className="bg-gray-800 rounded-lg shadow text-white text-sm font-medium overflow-hidden">

            {/* Marca */}
            <div
              className="px-3 py-2 cursor-pointer flex justify-between items-center"
              onClick={() => setMostrarMarcas(!mostrarMarcas)}
            >
              <span>Marca</span>
              <ChevronRight className={`w-4 h-4 transform transition-transform ${mostrarMarcas ? 'rotate-90' : ''}`} />
            </div>
            {mostrarMarcas && (
              <ul
                className={`text-xs text-gray-200 overflow-hidden px-3 pb-2 ${
                  mostrarMarcas ? 'animate-accordionDown' : 'animate-accordionUp'
                }`}
              >
                {[...new Set(productos.map(p => p.marca))].map((marca) => {
                  const checked = filtroMarca.includes(marca);
                  return (
                    <li
                      key={marca}
                      className="flex justify-between items-center py-1 hover:bg-gray-700 cursor-pointer rounded px-2"
                      onClick={() => {
                        setFiltroMarca(checked
                          ? filtroMarca.filter(m => m !== marca)
                          : [...filtroMarca, marca]
                        );
                      }}
                    >
                      <span>{marca}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="accent-blue-500"
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Filtros extra solo para "todos" */}
            {tipo === 'todos' && (
              <>
                {/* Categoría */}
                <div
                  className="px-3 py-2 cursor-pointer flex justify-between items-center border-t border-gray-700"
                  onClick={() => setMostrarCategorias((prev) => !prev)}
                >
                  <span>Categorías</span>
                  <ChevronRight className={`w-4 h-4 transform transition-transform ${mostrarCategorias ? 'rotate-90' : ''}`} />
                </div>
                {mostrarCategorias && (
                  <ul className="text-xs text-gray-200 overflow-hidden px-3 pb-2 animate-accordionDown">
                    {categorias.map((cat) => {
                      const checked = filtroCategoria.includes(cat.id_categoria);
                      return (
                        <li key={cat.id_categoria}
                            className="flex justify-between items-center py-1 hover:bg-gray-700 cursor-pointer rounded px-2"
                            onClick={() =>
                              setFiltroCategoria(checked
                                ? filtroCategoria.filter(c => c !== cat.id_categoria)
                                : [...filtroCategoria, cat.id_categoria])
                            }
                        >
                          <span>{cat.nombre}</span>
                          <input type="checkbox" checked={checked} readOnly className="accent-blue-500" />
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Temporada */}
                <div
                  className="px-3 py-2 cursor-pointer flex justify-between items-center border-t border-gray-700"
                  onClick={() => setMostrarTemporadas((prev) => !prev)}
                >
                  <span>Temporadas</span>
                  <ChevronRight className={`w-4 h-4 transform transition-transform ${mostrarTemporadas ? 'rotate-90' : ''}`} />
                </div>
                {mostrarTemporadas && (
                  <ul className="text-xs text-gray-200 overflow-hidden px-3 pb-2 animate-accordionDown">
                    {temporadas.map((temp) => {
                      const checked = filtroTemporada.includes(temp.id_temporada);
                      return (
                        <li key={temp.id_temporada}
                            className="flex justify-between items-center py-1 hover:bg-gray-700 cursor-pointer rounded px-2"
                            onClick={() =>
                              setFiltroTemporada(checked
                                ? filtroTemporada.filter(t => t !== temp.id_temporada)
                                : [...filtroTemporada, temp.id_temporada])
                            }
                        >
                          <span>{temp.nombre}</span>
                          <input type="checkbox" checked={checked} readOnly className="accent-blue-500" />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}

            {/* Precio */}
            <div
              className="px-3 py-2 cursor-pointer flex justify-between items-center border-t border-gray-700"
              onClick={() => setMostrarPrecios(!mostrarPrecios)}
            >
              <span>Precio</span>
              <ChevronRight className={`w-4 h-4 transform transition-transform ${mostrarPrecios ? 'rotate-90' : ''}`} />
            </div>
            {mostrarPrecios && (
              <ul
                className={`text-xs text-gray-200 overflow-hidden px-3 pb-2 ${
                  mostrarPrecios ? 'animate-accordionDown' : 'animate-accordionUp'
                }`}
              >
                {[0, 50, 100, 200, 300, 400].map((min, i, arr) => {
                  const max = arr[i + 1] || 500;
                  const selected = filtroPrecio?.min === min;
                  return (
                    <li
                      key={min}
                      className="flex justify-between items-center py-1 hover:bg-gray-700 cursor-pointer rounded px-2"
                      onClick={() => setFiltroPrecio(selected ? null : { min, max })}
                    >
                      <span>S/. {min} - S/. {max}</span>
                      <input
                        type="checkbox"
                        checked={selected}
                        readOnly
                        className="accent-blue-500"
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Limpiar filtros */}
            {(filtroMarca.length > 0 || filtroPrecio || filtroCategoria.length > 0 || filtroTemporada.length > 0) && (
              <div className="px-3 py-2 border-t border-gray-700">
                <button
                  className="w-full text-xs py-2 px-3 bg-red-600 hover:bg-red-700 rounded text-white font-semibold"
                  onClick={() => {
                    setFiltroMarca([]);
                    setFiltroPrecio(null);
                    setFiltroCategoria([]);
                    setFiltroTemporada([]);
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </aside>
        {/* Sección principal */}
        <section className="w-full md:w-[79%]">
          <nav className="text-sm text-gray-500 mb-2">
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/')}>Home</span>
            <span className="mx-2">{'>'}</span>
            <span className="text-black font-medium">{titulo}</span>
          </nav>

          <p className="text-xl font-semibold text-gray-800 mb-6">
            {tipo === 'todos' ? (
              'Explora nuestro catálogo de productos'
            ) : tipo === 'temporada' ? (
              <>{titulo}: <span className="text-black">Nuestra Selección Especial</span></>
            ) : (
              <>Explora nuestro catálogo de <span className="text-black">{titulo}</span></>
            )}
          </p>

          <div className="text-sm text-gray-500 mb-4">
            Resultados: {productosFiltrados.length}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.length === 0 ? (
              <div className="col-span-full h-[400px] flex items-center justify-center bg-gray-100 text-gray-500 text-center p-10 rounded-lg shadow">
                No hay productos disponibles con los filtros seleccionados.
              </div>
            ) : (
              productosFiltrados.map((producto) => {
                const tieneDescuento = producto.precio_rebajado && parseFloat(producto.precio_rebajado) < parseFloat(producto.precio);
                const porcentajeDescuento = tieneDescuento ? Math.floor(((producto.precio - producto.precio_rebajado) / producto.precio) * 100) : 0;

                return (
                  <div
                    key={producto.id}
                    className="relative bg-gray-100 rounded-lg shadow-md overflow-hidden transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer"
                    onClick={() => {
                      if (tipo === 'categoria') {
                        sessionStorage.setItem('categoria-producto', JSON.stringify({ id: id, nombre: titulo }));
                      } else {
                        sessionStorage.removeItem('categoria-producto');
                      }
                      navigate(`/producto/${producto.id}`);
                    }}
                  >
                    {tieneDescuento ? (
                      <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-xs py-2 px-4 font-bold text-center z-10">🔥 OFERTA</div>
                    ) : (
                      <div className="absolute top-0 left-0 w-full bg-green-600 text-white text-xs py-2 px-4 font-bold text-center z-10">🆕 NOVEDAD</div>
                    )}

                    <div className="aspect-[3/4] w-full">
                      <img
                        src={producto.imagen_firmada}
                        alt={producto.nombre}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-sm mb-2">{producto.nombre}</h3>
                      {tieneDescuento ? (
                        <div className="flex justify-center items-center flex-wrap gap-2 mt-auto">
                          <span className="text-sm text-gray-400 line-through decoration-2 decoration-gray-400">S/. {producto.precio}</span>
                          <span className="text-base font-bold text-black">S/. {producto.precio_rebajado}</span>
                          <span className="text-xs font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">-{porcentajeDescuento}%</span>
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-black mt-auto">S/. {producto.precio}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}