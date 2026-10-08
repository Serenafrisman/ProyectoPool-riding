import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
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

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) setMensaje('Error: ' + error.message);
    else setMensaje('¡Ingreso correcto!');
  };

  // 2. Registrarse
  const registrar = async (e) => {
    e.preventDefault();
    setMensaje('');

    // Validar mail de ORT
    if (!email.endsWith('@est.ort.edu.ar')) {
      setMensaje('Error: Usá tu mail @est.ort.edu.ar');
      return;
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
}