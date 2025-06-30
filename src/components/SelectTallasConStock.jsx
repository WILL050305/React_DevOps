import { useEffect } from 'react';

export default function SelectTallasConStock({ tallas, todasLasTallas = [], setTallas }) {
  const toggleTalla = (id_talla) => {
    setTallas(prev => {
      const yaExiste = prev.some(t => t.id_talla === id_talla);
      if (yaExiste) return prev.filter(t => t.id_talla !== id_talla);
      return [...prev, { id_talla, stock: 0 }];
    });
  };

  const cambiarStock = (id_talla, nuevoStock) => {
    const parsed = parseInt(nuevoStock, 10);
    setTallas(prev => prev.map(t => t.id_talla === id_talla ? { ...t, stock: isNaN(parsed) ? 0 : parsed } : t));
  };

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-4 text-center">Tallas disponibles</label>
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {todasLasTallas.map(({ id_talla, nombre }) => (
          <button
            key={id_talla}
            type="button"
            onClick={() => toggleTalla(id_talla)}
            className={`px-3 py-1 rounded border transition-colors ${
              tallas.some(t => t.id_talla === id_talla) ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {nombre}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tallas.map(({ id_talla, stock }) => {
          const talla = todasLasTallas.find(t => t.id_talla === id_talla);
          return (
            <div key={id_talla} className="flex items-center gap-2">
              <label>Stock para {talla ? talla.nombre : 'Talla'}:</label>
              <input
                type="number"
                value={stock}
                onChange={e => cambiarStock(id_talla, e.target.value)}
                className="w-24 p-1 border rounded"
                min="0"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
