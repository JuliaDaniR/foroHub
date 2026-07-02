import React, { useState } from 'react';

function Register({ onNavigateLogin }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState('ESTUDIANTE');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/usuario/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          email,
          password,
          perfil,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el usuario. Es posible que el email ya esté en uso.');
      }

      setSuccess(true);
      setTimeout(() => {
        onNavigateLogin();
      }, 2000);
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
      background: 'radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.1), transparent)'
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/img/logo-foro-hub.png" alt="ForoHub Logo" style={{ margin: '0 auto 1rem', width: '4.5rem', height: '4.5rem', display: 'block', objectFit: 'contain' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Crea tu cuenta</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Únete a la comunidad de ForoHub</p>
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

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: 'var(--success-color)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.25rem'
          }}>
            ✅ ¡Registro exitoso! Redirigiendo al login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                id="nombre"
                type="text"
                placeholder="Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
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

            <div className="form-group" style={{ marginBottom: 0 }}>
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

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="perfil">Perfil</label>
              <select
                id="perfil"
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
              >
                <option value="ESTUDIANTE">Estudiante</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="MODERADOR">Moderador</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
            disabled={loading || success}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>¿Ya tienes una cuenta? </span>
          <span
            onClick={onNavigateLogin}
            style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}
          >
            Inicia sesión aquí
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;
