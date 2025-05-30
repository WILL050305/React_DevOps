// Campaigns.jsx
function Campaigns() {
  return (
    <div className="bg-white py-10 px-4 md:px-12">
      <span className="text-2xl font-semibold mb-6 block">Campañas de Temporada</span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2 cursor-pointer">
          <img src="/images/PORTADA.png" alt="Campaña de Verano" className="w-full h-[22rem] object-cover" />
          <div className="absolute bottom-0 w-full bg-black/60 text-white p-4">
            <h3 className="text-xl font-semibold">Campaña de Verano</h3>
            <p className="text-sm">¡Descubre lo último para el calor con estilo!</p>
          </div>
        </div>
        <div className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2 cursor-pointer">
          <img src="/images/PORTADA.png" alt="Campaña de Invierno" className="w-full h-[22rem] object-cover" />
          <div className="absolute bottom-0 w-full bg-black/60 text-white p-4">
            <h3 className="text-xl font-semibold">Campaña de Invierno</h3>
            <p className="text-sm">Abrígate con lo mejor de nuestra colección invernal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Campaigns;
