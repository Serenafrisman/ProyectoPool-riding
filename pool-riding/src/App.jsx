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
  const [telefono, setTelefono] = useState('');
  const [patente, setPatente] = useState('');
  const [modeloAuto, setModeloAuto] = useState('');

  // 1. Iniciar Sesión
  const ingresar = async (e) => {
    e.preventDefault();
    setMensaje('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMensaje('Error: ' + error.message);
    } else {
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

    if (!email.endsWith('@est.ort.edu.ar')) {
      setMensaje('Error: Usá tu mail @est.ort.edu.ar');
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return setMensaje('Error: ' + error.message);

    const { error: errorTabla } = await supabase
      .from('perfiles')
      .insert([{ id: data.user.id, nombre, apellido }]);

    if (errorTabla) setMensaje('Error en perfil: ' + errorTabla.message);
    else {
      setMensaje('¡Cuenta creada! Ya podés ingresar.');
      setEsRegistro(false);
    }
  };
  const registrarConductor = async (e) => {
    e.preventDefault();
  
    await supabase
      .from('perfiles')
      .update({ 
        telefono: telefono, 
        patente: patente, 
        modelo_auto: modeloAuto 
      })
      .eq('id', session.user.id);
  
    alert('¡Datos guardados!');
  };

  // 3. VISTA HOME (Si hay sesión activa)
  if (session) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>¡Bienvenido a la Home de Pool-Riding! </h1>
        <p>Iniciaste sesión como: <strong>{session.user.email}</strong></p>
        <button 
          onClick={async () => { 
            await supabase.auth.signOut(); 
            setSession(null); 
            setEsRegistro(false);
          }}
          style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }
  if (session) {
    return (
      <div>
        <h2> Pizarrón de Viajes</h2>
        <p>Usuario: {session.user.email}</p>
  
        {/* Formulario de Conductor */}
        <form onSubmit={registrarConductor}>
          <h3>Descripción del conductor</h3>
  
          <label>Teléfono:</label>
          <input 
            type="text" 
            value={telefono} 
            onChange={(e) => setTelefono(e.target.value)} 
          />
  
          <br /><br />
  
          <label>Patente:</label>
          <input 
            type="text" 
            value={patente} 
            onChange={(e) => setPatente(e.target.value)} 
          />
  
          <br /><br />
  
          <label>Modelo de auto:</label>
          <input 
            type="text" 
            value={modeloAuto} 
            onChange={(e) => setModeloAuto(e.target.value)} 
          />
  
          <br /><br />
  
          <button type="submit">Guardar datos</button>
        </form>
      </div>
    );
  }
  // 4. VISTA LOGIN / REGISTRO (Si NO hay sesión)
  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Pool-Riding</h1>

      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => setEsRegistro(false)}>Iniciar Sesión</button>
        <button onClick={() => setEsRegistro(true)} style={{ marginLeft: '10px' }}>Registrarse</button>
      </div>

      <h3>{esRegistro ? 'Crear Cuenta' : 'Ingresar'}</h3>

      <form onSubmit={esRegistro ? registrar : ingresar}>
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

      {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
    </div>
  );
}