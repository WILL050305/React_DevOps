import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CategorySlider() {
  const [categories, setCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const autoAdvanceIntervalRef = useRef(null); 

  const navigate = useNavigate();

  const itemsPerView = 3;
  const autoAdvanceDelay = 5000; // 5 segundos para el auto-avance

  // Cálculos de layout (mantener si necesitas el ancho de las tarjetas)
  const x = 16; 
  const spacing = 2 * x; 
  const containerPadding = 2 * x; 
  const imageWidth = `calc((100% - ${containerPadding + (itemsPerView - 1) * spacing}px) / ${itemsPerView})`;

  // --- Lógica de carga de categorías ---
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      const { data, error } = await supabase.from('categorias').select('*');
      if (error) {
        console.error('Error cargando categorías', error);
        setIsLoadingCategories(false);
        return;
      }
      const conUrlsFirmadas = await Promise.all(
        data.map(async (c) => {
          if (!c.imagen_url) return { ...c, signedUrl: '' };
          const { data: signedData } = await supabase
            .storage
            .from('categorias')
            .createSignedUrl(c.imagen_url, 3600);
          return {
            ...c,
            signedUrl: signedData?.signedUrl || '',
          };
        })
      );
      setCategories(conUrlsFirmadas);
      setIsLoadingCategories(false);
    };

    fetchCategories();
  }, []);

  // --- Manejador para el botón "Siguiente" ---
  const handleNext = useCallback(() => {
    if (categories.length === 0) return;
    setCurrentIndex(prevIndex => (prevIndex + 1) % categories.length);
  }, [categories.length]); 

  // --- Manejador para el botón "Anterior" ---
  const handlePrev = useCallback(() => {
    if (categories.length === 0) return;
    setCurrentIndex(prevIndex => (prevIndex - 1 + categories.length) % categories.length);
  }, [categories.length]); 

  // --- Función para iniciar o reiniciar el contador de auto-avance ---
  const startAutoAdvanceTimer = useCallback(() => {
    clearInterval(autoAdvanceIntervalRef.current); 
    autoAdvanceIntervalRef.current = setInterval(() => {
      handleNext(); 
    }, autoAdvanceDelay);
  }, [handleNext, autoAdvanceDelay]); 

  // --- Lógica de Auto-avance: Iniciar al cargar o cuando cambian las categorías ---
  useEffect(() => {
    if (categories.length > 0 && !isLoadingCategories) {
      startAutoAdvanceTimer(); 
    }

    return () => {
      clearInterval(autoAdvanceIntervalRef.current);
    };
  }, [categories, isLoadingCategories, startAutoAdvanceTimer]);

  // --- Wrapper para handleNext/handlePrev que reinicia el temporizador ---
  const handleNextWithRestart = useCallback(() => {
    handleNext();
    startAutoAdvanceTimer();
  }, [handleNext, startAutoAdvanceTimer]);

  const handlePrevWithRestart = useCallback(() => {
    handlePrev();
    startAutoAdvanceTimer();
  }, [handlePrev, startAutoAdvanceTimer]);


  // --- Función para obtener los ítems visibles ---
  const getVisibleCategories = () => {
    const visible = [];
    for (let i = 0; i < itemsPerView; i++) {
      visible.push(categories[(currentIndex + i) % categories.length]);
    }
    return visible;
  };

  // --- Renderizado del componente ---
  if (isLoadingCategories) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
      // ERROR SOLUCIONADO: Se eliminó el '>' extra aquí.
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white py-10 px-4 md:px-12 text-center text-gray-500">
        No hay categorías disponibles.
      </div>
    );
  }

  return (
    <div className="bg-white py-10 px-4 md:px-12 relative">
      <div className="flex justify-between items-center mb-6">
        <span className="text-2xl font-semibold">Categorías</span>
      </div>

      {/* Botones de navegación */}
      <button
        onClick={handlePrevWithRestart}
        className={`absolute left-2 top-1/2 transform -translate-y-1/2 
                    bg-white/40 backdrop-blur-sm 
                    border border-white/60 
                    shadow-md hover:shadow-lg 
                    hover:scale-110 
                    transition-all duration-200 
                    p-3 rounded-full 
                    flex items-center justify-center 
                    z-10`}
      >
        <ChevronLeft size={24} className="text-gray-800" /> 
      </button>
      <button
        onClick={handleNextWithRestart}
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                    bg-white/40 backdrop-blur-sm 
                    border border-white/60 
                    shadow-md hover:shadow-lg 
                    hover:scale-110 
                    transition-all duration-200 
                    p-3 rounded-full 
                    flex items-center justify-center 
                    z-10`}
      >
        <ChevronRight size={24} className="text-gray-800" /> 
      </button>

      {/* Contenedor del carrusel */}
      <div className="overflow-hidden px-0">
        <div 
          className="flex justify-between" 
          style={{ paddingLeft: `${x}px`, paddingRight: `${x}px` }} 
        >
          {getVisibleCategories().map((cat) => (
            <div
              key={cat.id_categoria} 
              style={{ width: imageWidth }} 
              className="relative rounded overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer shrink-0"
              onClick={() => navigate(`/ver/categoria/${cat.id_categoria}`)} // para categorías
            >
              <div className="relative overflow-hidden">
                <img
                  loading="lazy"
                  src={cat.signedUrl || '/fallback.jpg'}
                  alt={cat.nombre}
                  className="w-full h-[28rem] object-cover object-top transition-transform duration-500 hover:scale-110"
                  onError={(e) => {
                    e.target.src = '/fallback.jpg';
                    e.target.alt = 'No se pudo cargar';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-white p-4 text-center">
                  <div className="absolute inset-0 bg-white/5 transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                  <h3 className="text-lg font-semibold relative z-10 transform transition-all duration-300 hover:scale-105">
                    {cat.nombre}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}