import React, { useState } from 'react';

const FormularioAuth = () => {
  const [activo, setActivo] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className={`relative w-[768px] max-w-full min-h-[480px] bg-white rounded-[30px] shadow-2xl overflow-hidden transition-all duration-700 ${activo ? 'bg-right' : 'bg-left'}`}>
        {/* Panel Registro */}
        <div className={`absolute top-0 left-0 w-1/2 h-full px-12 flex flex-col justify-center items-center text-center transition-all duration-700 ${activo ? 'translate-x-full opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <h1 className="text-3xl font-bold">Crear Cuenta</h1>
          <span className="text-sm mb-4">o usa tu correo para registrarte</span>
          <input type="text" placeholder="Nombre" className="mb-2 w-full px-4 py-2 rounded bg-gray-100" />
          <input type="email" placeholder="Correo electrónico" className="mb-2 w-full px-4 py-2 rounded bg-gray-100" />
          <input type="password" placeholder="Contraseña" className="mb-4 w-full px-4 py-2 rounded bg-gray-100" />
          <button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2 rounded-full">Registrarse</button>
        </div>

        {/* Panel Login */}
        <div className={`absolute top-0 left-0 w-1/2 h-full px-12 flex flex-col justify-center items-center text-center transition-all duration-700 ${activo ? 'translate-x-full opacity-0 z-0' : 'opacity-100 z-10'}`}>
          <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
          <span className="text-sm mb-4">o usa tu correo y contraseña</span>
          <input type="email" placeholder="Correo electrónico" className="mb-2 w-full px-4 py-2 rounded bg-gray-100" />
          <input type="password" placeholder="Contraseña" className="mb-2 w-full px-4 py-2 rounded bg-gray-100" />
          <a href="#" className="text-xs text-gray-500 mb-4">¿Olvidaste tu contraseña?</a>
          <button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2 rounded-full">Iniciar Sesión</button>
        </div>

        {/* Panel de fondo con transición */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-r from-indigo-500 to-teal-400 text-white px-10 flex flex-col justify-center items-center text-center transition-all duration-700 ${activo ? '-translate-x-full rounded-l-[100px]' : 'translate-x-0 rounded-r-[100px]'}`}>
          <div className={`transition-all duration-700 ${activo ? 'opacity-0 z-0' : 'opacity-100 z-10'}`}>
            <h1 className="text-3xl font-bold mb-2">¡Hola, Amigo!</h1>
            <p className="text-sm mb-6">Regístrate con tus datos personales para usar todas las funciones del sitio</p>
            <button className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-indigo-600 font-semibold transition" onClick={() => setActivo(true)}>
              Registrarse
            </button>
          </div>
          <div className={`absolute transition-all duration-700 ${activo ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <h1 className="text-3xl font-bold mb-2">¡Bienvenido de nuevo!</h1>
            <p className="text-sm mb-6">Ingresa tus datos personales para usar todas las funciones del sitio</p>
            <button className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-indigo-600 font-semibold transition" onClick={() => setActivo(false)}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioAuth;
