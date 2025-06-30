import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function EditCampaigns({ onClose }) {
  const [temporadas, setTemporadas] = useState([]);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    fetchTemporadas();
    // eslint-disable-next-line
  }, []);

  const fetchTemporadas = async () => {
    const { data, error } = await supabase
      .from('temporadas')
      .select('id_temporada, nombre, mostrar');

    if (error) {
      console.error('Error al obtener temporadas:', error);
    } else {
      setTemporadas(data);
    }
  };

  const handleToggleMostrar = async (id, current) => {
    setActualizando(true);
    const { error } = await supabase
      .from('temporadas')
      .update({ mostrar: !current })
      .eq('id_temporada', id);

    if (error) {
      console.error('Error actualizando mostrar:', error);
    } else {
      setTemporadas(temporadas.map(t => t.id_temporada === id ? { ...t, mostrar: !current } : t));
    }
    setActualizando(false);
  };

  const handleNombreChange = async (id, nuevoNombre) => {
    setActualizando(true);
    const { error } = await supabase
      .from('temporadas')
      .update({ nombre: nuevoNombre })
      .eq('id_temporada', id);

    if (error) {
      console.error('Error actualizando nombre:', error);
    } else {
      setTemporadas(temporadas.map(t => t.id_temporada === id ? { ...t, nombre: nuevoNombre } : t));
    }
    setActualizando(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Editar Campañas</h2>
      {temporadas.map((t) => (
        <div key={t.id_temporada} className="flex items-center gap-4 border-b pb-2">
          <input
            type="text"
            value={t.nombre}
            onChange={(e) => handleNombreChange(t.id_temporada, e.target.value)}
            className="border p-2 rounded w-1/2"
            disabled={actualizando}
          />
          <button
            type="button"
            onClick={() => handleToggleMostrar(t.id_temporada, t.mostrar)}
            className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
              t.mostrar ? 'bg-green-500' : 'bg-gray-300'
            }`}
            disabled={actualizando}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ${
                t.mostrar ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      ))}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
