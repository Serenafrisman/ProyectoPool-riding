import React, { useState } from 'react';
import { supabase } from './supabaseClient';

// 1. Abrís la función principal del componente
function App() {
  
  // 2. Definís los estados (variables de la pantalla)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  // 3. Creás la función que se ejecuta al hacer clic en "Ingresar"
  const handleLogin = async (e) => {
    e.preventDefault();

    // AQUÍ SÍ VA EL IF: Está adentro de 'handleLogin'
    if (!email.endsWith('@est.ort.edu.ar')) {
      setMensaje('Error: Debes usar tu correo institucional (@est.ort.edu.ar)');
      return; // <-- AHORA SÍ ES VÁLIDO: significa "cortá la función handleLogin y no llames a Supabase"
    }

    // Si pasó la validación del mail, llama a Supabase:
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMensaje('Error: ' + error.message);
    } else {
      setMensaje('¡Ingreso correcto!');
    }
  };

  // 4. Devolvés lo que se dibuja en la pantalla (HTML/JSX)
  return (
    <div>
      <h2>Pool-Riding 🚗</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit">Ingresar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}
       const { data, error } = await supabase.auth.signInWithPassword({
       email: email,
       password: password,
});
// 5. Exportás el componente para que Vite lo use
export default App;