import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const FormularioAuth = () => {
  const [activo, setActivo] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    repetirPassword: '',
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const handleRegister = async () => {
    if (form.password !== form.repetirPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre: form.nombre,
          apellido: form.apellido,
          rol: 'cliente',
        },
      },
    });

    if (error) {
      alert('Error al registrar: ' + error.message);
      console.error(error);
      return;
    }

    // Mostrar el modal de verificación
    setRegistroExitoso(true);

    // Insertar en la tabla usuarios (si ya hay un user disponible)
    if (data?.user) {
      const { id, email, user_metadata } = data.user;
      const { nombre, apellido } = user_metadata;

      // Verifica si ya existe el usuario
      const { data: existe, error: errorExiste } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('id_usuario', id)
        .maybeSingle();

      if (errorExiste) {
        console.error('Error al verificar existencia:', errorExiste.message);
      } else if (!existe) {
        // Si no existe, inserta
        const { error: errorInsert } = await supabase.from('usuarios').insert({
          id_usuario: id,
          nombre,
          apellido,
          correo: email,
        });

        if (errorInsert) {
          console.error('Error al insertar nuevo usuario:', errorInsert.message);
          alert('Error al guardar el usuario en la base de datos');
        }
      } else {
        // Si existe, actualiza datos
        const { error: errorUpdate } = await supabase
          .from('usuarios')
          .update({
            nombre,
            apellido,
            correo: email,
          })
          .eq('id_usuario', id);

        if (errorUpdate) {
          console.error('Error al actualizar usuario:', errorUpdate.message);
        }
      }
    }
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });

    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
      console.error(error);
      return;
    }

    const { user } = data;
    const id = user?.id;
    const email = user?.email;
    const { nombre, apellido } = user?.user_metadata || {};
    const rol = user?.user_metadata?.rol;

    // 1. Verifica si ya existe
    const { data: existe, error: errorExiste } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('id_usuario', id)
      .maybeSingle();

    if (errorExiste) {
      console.error('Error al verificar existencia:', errorExiste.message);
    } else if (!existe) {
      // 2. Si no existe, insertamos
      const { error: errorInsert } = await supabase.from('usuarios').insert({
        id_usuario: id,
        nombre,
        apellido,
        correo: email,
      });

      if (errorInsert) {
        console.error('Error al insertar en usuarios:', errorInsert.message);
        alert('No se pudo registrar el usuario en la base de datos.');
        return;
      }
    } else {
      // 3. Si existe pero sus datos están incompletos, actualízalo
      const { error: errorUpdate } = await supabase
        .from('usuarios')
        .update({
          nombre,
          apellido,
          correo: email,
        })
        .eq('id_usuario', id);

      if (errorUpdate) {
        console.error('Error al actualizar usuario:', errorUpdate.message);
      }
    }

    alert('Sesión iniciada con éxito');
    if (rol === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className={`relative w-[768px] max-w-full min-h-[480px] bg-white rounded-[30px] shadow-2xl overflow-hidden transition-all duration-700 ${activo ? 'bg-right' : 'bg-left'}`}>

        {/* Registro */}
        <div className={`absolute top-0 left-0 w-1/2 h-full px-12 flex flex-col justify-center items-center text-center transition-all duration-700 ${activo ? 'translate-x-full opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <h1 className="text-3xl font-bold">Crear Cuenta</h1>
          <span className="text-sm mb-4">Usa tus datos personales</span>
          <input type="text" placeholder="Nombre" className="mb-2 w-full px-4 py-2 rounded bg-gray-100"
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <input type="text" placeholder="Apellido" className="mb-2 w-full px-4 py-2 rounded bg-gray-100"
            onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          <input type="email" placeholder="Correo electrónico" className="mb-2 w-full px-4 py-2 rounded bg-gray-100"
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Contraseña" className="mb-2 w-full px-4 py-2 rounded bg-gray-100"
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input type="password" placeholder="Repetir contraseña" className="mb-4 w-full px-4 py-2 rounded bg-gray-100"
            onChange={(e) => setForm({ ...form, repetirPassword: e.target.value })} />
          <button onClick={handleRegister} className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2 rounded-full">Registrarse</button>
        </div>

        {/* Login */}
        <div className={`absolute top-0 left-0 w-1/2 h-full px-12 flex flex-col justify-center items-center text-center transition-all duration-700 ${activo ? 'translate-x-full opacity-0 z-0' : 'opacity-100 z-10'}`}>
          <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
          <span className="text-sm mb-4">Ingresa tu correo y contraseña</span>
          <input type="email" placeholder="Correo electrónico" className="mb-2 w-full px-4 py-2 rounded bg-gray-100"
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
          <input type="password" placeholder="Contraseña" className="mb-2 w-full px-4 py-2 rounded bg-gray-100"
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
          <a href="#" className="text-xs text-gray-500 mb-4">¿Olvidaste tu contraseña?</a>
          <button onClick={handleLogin} className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2 rounded-full">Iniciar Sesión</button>
        </div>

        {/* Fondo de transición */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-r from-indigo-500 to-teal-400 text-white px-10 flex flex-col justify-center items-center text-center transition-all duration-700 ${activo ? '-translate-x-full rounded-l-[100px]' : 'translate-x-0 rounded-r-[100px]'}`}>
          <div className={`transition-all duration-700 ${activo ? 'opacity-0 z-0' : 'opacity-100 z-10'}`}>
            <h1 className="text-3xl font-bold mb-2">¡Bienvenido!</h1>
            <p className="text-sm mb-6">¿Aún no te has registrado?</p>
            <button className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-indigo-600 font-semibold transition" onClick={() => setActivo(true)}>
              Registrarse
            </button>
          </div>
          <div className={`absolute transition-all duration-700 ${activo ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <h1 className="text-3xl font-bold mb-2">¡Bienvenido de nuevo!</h1>
            <p className="text-sm mb-6">¿Ya tienes una cuenta?</p>
            <button className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-indigo-600 font-semibold transition" onClick={() => setActivo(false)}>
              Iniciar Sesión
            </button>
          </div>
        </div>

        {/* Modal de verificación */}
        {registroExitoso && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
            <div className="bg-white max-w-md mx-auto p-8 rounded-xl shadow-lg text-center animate-fade-in">
              <h2 className="text-xl font-bold mb-4 text-red-600">Verificación requerida</h2>
              <p className="text-gray-700 mb-6 text-sm">
                Por motivos de seguridad, se ha enviado un enlace de verificación a su correo electrónico. Puede cerrar esta ventana. 
                La sesión se iniciará automáticamente una vez que acceda al enlace proporcionado. 
                Esta verificación solo se realizará una vez y no afectará futuros inicios de sesión.
              </p>
              <button
                onClick={() => {
                  setActivo(false); // volver al login
                  setRegistroExitoso(false);
                }}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-full font-semibold"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormularioAuth;
