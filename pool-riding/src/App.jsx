import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [session, setSession] = useState(null);
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [mensaje, setMensaje] = useState('');

  // 1. Iniciar Sesión
  const ingresar = async (e) => {
    e.preventDefault();
    setMensaje('');
  
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
    if (error) {
      setMensaje('Error: ' + error.message);
    } else {
      // Al guardar la sesión, React cambia automáticamente de pantalla
      setSession(data.session);
    }
   
  };
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);
  // 2. Registrarse
  const registrar = async (e) => {
    e.preventDefault();
    setMensaje('');

    // Validar mail de ORT
    if (!email.endsWith('@est.ort.edu.ar')) {
      setMensaje('Error: Usá tu mail @est.ort.edu.ar');
      
    }

    // Crear usuario en Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return setMensaje('Error: ' + error.message);

    // Crear perfil en la tabla
    const { error: errorTabla } = await supabase
      .from('perfiles')
      .insert([{ id: data.user.id, nombre, apellido }]);

    if (errorTabla) setMensaje('Error en perfil: ' + errorTabla.message);
    else {
      setMensaje('¡Cuenta creada! Ya podés ingresar.');
      setEsRegistro(false);
    }
  };
// 2. Condición: Si hay sesión activa, mostramos la Home
if (session) {
   (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>¡Bienvenido a la Home de Pool-Riding! 🚗</h1>
      <p>Iniciaste sesión como: <strong>{session.user.email}</strong></p>
      <button onClick={async () => { await supabase.auth.signOut(); setSession(null); setEsRegistro(false);}}>Cerrar Sesión</button>
    </div>
  );
}

// 3. Si NO hay sesión, React sigue de largo y ejecuta el formulario de abajo
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Pool-Riding </h1>

      {/* Botones para cambiar entre Login y Registro */}
      <button onClick={() => setEsRegistro(false)}>Iniciar Sesión</button>
      <button onClick={() => setEsRegistro(true)}>Registrarse</button>

      <h3>{esRegistro ? 'Crear Cuenta' : 'Ingresar'}</h3>

      <form onSubmit={esRegistro ? registrar : ingresar}>
        {/* Si está en modo registro, muestra Nombre y Apellido */}
        {esRegistro && (
          <>
            <input 
              placeholder="Nombre" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
            />
            <br /><br />
            <input 
              placeholder="Apellido" 
              value={apellido} 
              onChange={(e) => setApellido(e.target.value)} 
              required 
            />
            <br /><br />
          </>
        )}

        <input 
          type="email" 
          placeholder="Correo (@est.ort.edu.ar)" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <br /><br />

        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <br /><br />

        <button type="submit">{esRegistro ? 'Registrarme' : 'Entrar'}</button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
  return (
    <div>
      {/* Formulario de Login o Registro */}
    </div>
  );
  
}
