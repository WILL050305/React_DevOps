import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Campaigns() {
  const [temporadas, setTemporadas] = useState([]);
  const [index, setIndex] = useState(0);
  const [isLoadingTemporadas, setIsLoadingTemporadas] = useState(true);
  const timeoutRef = useRef(null);
  const itemsPerPage = 2;
  const navigate = useNavigate();

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
    }
  };

  const startTimer = useCallback(() => {
    clearTimer();
    timeoutRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % temporadas.length);
    }, 15000);
  }, [temporadas.length]);

  useEffect(() => {
    const fetchTemporadas = async () => {
      const { data, error } = await supabase
        .from('temporadas')
        .select('*')
        .eq('mostrar', true);
      if (error) {
        console.error('Error cargando temporadas', error);
        setIsLoadingTemporadas(false);
        return;
      }
      const conUrlsFirmadas = await Promise.all(
        data.map(async (t) => {
          if (!t.imagen_url) return { ...t, signedUrl: '' };
          const { data: signedData } = await supabase
            .storage
            .from('temporada')
            .createSignedUrl(t.imagen_url, 3600);
          return {
            ...t,
            signedUrl: signedData?.signedUrl || '',
          };
        })
      );
      setTemporadas(conUrlsFirmadas);
      setIsLoadingTemporadas(false);
    };
    fetchTemporadas();
  }, []);

  useEffect(() => {
    if (temporadas.length > 0) startTimer();
    return () => clearTimer();
  }, [temporadas, startTimer]);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + temporadas.length) % temporadas.length);
    startTimer();
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % temporadas.length);
    startTimer();
  };

  const x = 16; // px
  const spacing = 2 * x;
  const containerPadding = 2 * x; // left + right
  const imageWidth = `calc((100% - ${containerPadding + spacing}px) / 2)`;

  if (isLoadingTemporadas) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  const getVisibleItems = () => {
    const firstIndex = index % temporadas.length;
    const secondIndex = (index + 1) % temporadas.length;
    return [temporadas[firstIndex], temporadas[secondIndex]];
  };

  return (
    <div id="campanas" className="scroll-mt-[80px] bg-white py-10 px-4 md:px-12 relative">
      <div className="flex justify-between items-center mb-6">
        <span className="text-2xl font-semibold">Campañas de Temporada</span>
      </div>

      {/* Botones laterales */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/40 backdrop-blur-sm border border-white/60 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 p-3 rounded-full z-10"
        aria-label="Anterior"
      >
        <ChevronLeft size={24} className="text-gray-800" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/40 backdrop-blur-sm border border-white/60 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 p-3 rounded-full z-10"
        aria-label="Siguiente"
      >
        <ChevronRight size={24} className="text-gray-800" />
      </button>

      <div className="overflow-hidden px-4">
        <div className="flex gap-[32px] justify-between" style={{ paddingLeft: `${x}px`, paddingRight: `${x}px` }}>
          {getVisibleItems().map((t) => (
            <div
              key={t.id_temporada}
              style={{ width: imageWidth }}
              className="relative rounded overflow-hidden shadow shrink-0 cursor-pointer group"
              onClick={() => {
                navigate(`/views/temporada/${t.id_temporada}`);
              }}
            >
              <img
                src={t.signedUrl || '/fallback.jpg'}
                alt={t.nombre}
                className="w-full h-[22rem] object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = '/fallback.jpg';
                  e.target.alt = 'No se pudo cargar';
                }}
              />
              <div className="absolute bottom-0 w-full bg-black/60 text-white p-4">
                <h3 className="text-xl font-semibold">{t.nombre}</h3>
                <p className="text-sm">{t.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
