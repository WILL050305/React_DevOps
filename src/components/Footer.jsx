// Footer.jsx
function Footer() {
  return (
    <footer className="bg-black text-white py-10 px-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="flex-1 text-left">
          <h3 className="text-lg font-bold mb-4">Más información</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://www.facebook.com/people/Vereau-for-mens-Oficial/100083421365189/"
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Conócenos
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/vereauformens/"
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Nosotros
              </a>
            </li>
            {/* <li><a href="#" className="hover:underline">Jacto</a></li>
            <li><a href="#" className="hover:underline">Decarios</a></li> */}
            <li>
              <a
                href="https://maps.app.goo.gl/tKuTtd3wKELTzCHb6"
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Encuéntranos
              </a>
            </li>
          </ul>
        </div>

        <div className="flex-1 text-left">
          <h3 className="text-lg font-bold mb-4">¡Únete a VEREAU FOR MEN'S!</h3>
          <p className="text-sm mb-4">Sé la primera en enterarte de nuestras novedades y ofertas especiales!</p>
          <form className="space-y-3">
            <div className="relative">
              <label className="block text-sm mb-1">Correo electrónico</label>
              <input
                type="email"
                className="w-full px-3 py-2 pr-10 rounded text-black border border-gray-300"
                placeholder="Ingresa tu correo"
              />
              <button
                type="submit"
                className="absolute top-[36px] right-[10px] flex items-center p-0 bg-transparent border-none outline-none transition-transform duration-200 hover:text-gray-600 focus:text-gray-600 hover:scale-125"
                tabIndex={0}
                aria-label="Enviar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="newsletter" className="mr-2" />
              <label htmlFor="newsletter" className="text-sm">
                Acepta recibir boletín. Consulta nuestra Política de Privacidad.
              </label>
            </div>
          </form>
        </div>

        <div className="w-full md:hidden h-px bg-gray-700 my-4"></div>

        <div className="flex-1 text-left md:text-right space-y-4">
          <h3 className="text-lg font-bold">VEREAU FOR MEN'S</h3>
          <p className="text-sm">Email: vereauformens@gmail.com</p>
          <p className="text-sm">Teléfono: 924 937 148</p>
          <p className="text-sm">
            Dirección: Chincha Calle Mariscal Castilla #218<br />
            Pisco Calle Libertad #175, Chincha Alta, Peru
          </p>
        </div>
      </div>
      <div className="text-center text-sm text-gray-400 mt-8 border-t border-gray-800 pt-6">
        © 2025 VEREAU FOR MEN'S. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;