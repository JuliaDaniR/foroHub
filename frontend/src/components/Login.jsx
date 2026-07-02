import React, { useState } from 'react';

function Login({ onLoginSuccess, onNavigateRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correoElectronico: email,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Credenciales incorrectas o error en el servidor.');
      }

      const data = await response.json();
      // Supports both field names
      const token = data.jwtToken || data.token;
      const name = data.nombreUsuario || data.nombre || email;
      const id = data.id;
      const perfil = data.perfil;
      
      onLoginSuccess(token, name, id, perfil);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem',
      background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent)'
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/img/logo-foro-hub.png" alt="ForoHub Logo" style={{ margin: '0 auto 1rem', width: '4.5rem', height: '4.5rem', display: 'block', objectFit: 'contain' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Bienvenido de nuevo</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Inicia sesión para entrar al foro</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger-color)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.25rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>¿No tienes una cuenta? </span>
          <span
            onClick={onNavigateRegister}
            style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}
          >
            Regístrate aquí
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
