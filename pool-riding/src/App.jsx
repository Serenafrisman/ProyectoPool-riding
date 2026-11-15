import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  //  
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
  const [mostrarFormViaje, setMostrarFormViaje] = useState(false);
  const [destino, setDestino] = useState('');
  const [horario, setHorario] = useState('');
  const [asientos, setAsientos] = useState(3);
  const [viajes, setViajes] = useState([]);

  const [esConductor, setEsConductor] = useState(localStorage.getItem('soyConductor') === 'true');

  // Estado para controlar la visibilidad del formulario de conductor
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombreCompleto, setnombreCompleto] = useState('');
  const [Correo, setCorreo] = useState('');
  const [emailPersonal, setEmailPersonal] = useState('');
  const [parienteDe, setParienteDe] = useState('');
  const [colorAuto, setColorAuto] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  //  INICIAR SESIÓN
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
  const iniciar = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);

    if (session) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (perfil && perfil.es_conductor) {
        setEsConductor(true);
        setPatente(perfil.patente || '');
      }
    }

    cargarViajes();
  };

  iniciar();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => subscription.unsubscribe();
}, []);

  // REGISTRARSE
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

  // FORM CONDUCTOR
  const cargarViajes = async () => {
    const { data } = await supabase.from('viajes').select('*');
    if (data) setViajes(data);
  };

  const registrarConductor = async (e) => {
    e.preventDefault();
        localStorage.setItem('soyConductor', 'true');

    const { error } = await supabase
      .from('perfiles')
      .update({
        telefono: telefono,
        patente: patente,
        modelo_auto: modeloAuto,
        es_conductor: true
      })

  if (!error) {
    setEsConductor(true);
    setMostrarForm(false);
  } else {
    alert('Error al guardar conductor: ' + error.message);
  }
};

  // PUBLICAR VIAJE
  const publicarViaje = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('viajes')
      .insert([{
        conductor_id: session.user.id,
        conductor_nombre: session.user.email,
        patente: patente,
        destino: destino,
        horario: horario,
        asientos_disponibles: Number(asientos)
      }]);

    if (!error) {
      alert('¡Viaje publicado!');
      setDestino('');
      setHorario('');
      setMostrarFormViaje(false);
      cargarViajes();
    } else {
      alert('Error: ' + error.message);
    }
  };

  //  VISTA HOME (SI HAY SESIÓN)
  if (session) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>¡Bienvenido a Pool-Riding! </h1>
        <p>Iniciaste sesión como: <strong>{session.user.email}</strong></p>

        {!mostrarForm ? (
          <button 
            onClick={() => setMostrarForm(true)}
            style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
          >
             Conducir
          </button>
        ) : (
          <div style={{ border: '1px solid #ccc', padding: '15px', margin: '15px auto', maxWidth: '300px', borderRadius: '8px' }}>
            
            <form onSubmit={registrarConductor}>
              <h3>Descripción del conductor</h3>
              
              <label>Nombre completo:</label>
              <input 
                type="text" 
                value={nombreCompleto} 
                onChange={(e) => setnombreCompleto(e.target.value)} 
                required
              />
      
              <br /><br />
       
              <label>Correo:</label>
              <input 
                type="text" 
                value={Correo} 
                onChange={(e) => setCorreo(e.target.value)} 
                required
              />
      
              <br /><br />
      
              <label>Teléfono:</label>
              <input 
                type="text" 
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)} 
                required
              />
      
              <br /><br />
      
              <label>Patente:</label>
              <input 
                type="text" 
                value={patente} 
                onChange={(e) => setPatente(e.target.value)} 
                required
              />
      
              <br /><br />
      
              <label>Modelo de auto:</label>
              <input 
                type="text" 
                value={modeloAuto} 
                onChange={(e) => setModeloAuto(e.target.value)} 
                required
              />
      
              <br /><br />
      
              <button type="submit">Empezar</button>
              <button 
                type="button" 
                onClick={() => setMostrarForm(false)} 
                style={{ marginLeft: '10px' }}
              >
                Cancelar
              </button>
            </form>
          </div>
        )}

        <br /><br />

        <hr />

        {esConductor && !mostrarFormViaje && (
          <button onClick={() => setMostrarFormViaje(true)}>
            Publicar Viaje
          </button>
        )}

        {esConductor && mostrarFormViaje && (
          <form onSubmit={publicarViaje}>
            <h3>Publicar Viaje (Desde ORT)</h3>
            <input placeholder="Destino" value={destino} onChange={(e) => setDestino(e.target.value)} required />
            <br /><br />
            <input placeholder="Horario" value={horario} onChange={(e) => setHorario(e.target.value)} required />
            <br /><br />
            <input type="number" min="1" max="3" value={asientos} onChange={(e) => setAsientos(e.target.value)} required />
            <br /><br />
            <button type="submit">Publicar</button>
            <button type="button" onClick={() => setMostrarFormViaje(false)}>Cancelar</button>
          </form>
        )}

        <button 
          onClick={async () => { 
            await supabase.auth.signOut(); 
            setSession(null); 
            setEsRegistro(false);
            setMostrarForm(false);
          }}
          style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // 6. VISTA LOGIN / REGISTRO (SI NO HAY SESIÓN)
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