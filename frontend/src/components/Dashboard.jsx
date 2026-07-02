import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CreateTopicModal from './CreateTopicModal';
import ManageCourses from './ManageCourses';

function Dashboard({ token, perfil, showToast, onSelectTopic }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageCoursesOpen, setIsManageCoursesOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Filters
  const [categoria, setCategoria] = useState('');
  const [anio, setAnio] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/usuario/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data || []);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const fetchTopics = async () => {
    setLoading(true);
    try {
      let url = `/topico/listar?page=${page}&size=10&sort=fechaCreacion,desc`;
      
      if (isFiltered && anio) {
        url = `/topico/listarPorCurso?anio=${anio}&page=${page}&size=10`;
        if (categoria) {
          url += `&categoriaPrincipal=${categoria}`;
        }
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(data.content || []);
        setTotalPages(data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchLeaderboard();
  }, [page, token, isFiltered]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(0);
    setIsFiltered(true);
  };

  const handleClearFilters = () => {
    setCategoria('');
    setAnio('');
    setIsFiltered(false);
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const user = localStorage.getItem('user');

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ textAlign: 'left' }}>
          {user && (
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              👋 ¡Hola, {user}!
            </span>
          )}
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.25rem 0 0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: '1.2' }}>
            Tópicos Recientes
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Consulta dudas y comparte conocimientos con la comunidad.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {perfil === 'ADMINISTRADOR' && (
            <button className="btn" onClick={() => setIsManageCoursesOpen(true)}>
              ⚙️ Gestionar Cursos
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            ✍️ Crear Tópico
          </button>
        </div>
      </div>
      <div className="dashboard-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Main Content (Left side) */}
        <div>
          {/* Filter panel */}
          <form onSubmit={handleApplyFilters} className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '2rem', padding: '1rem' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
                <option value="">Todas las Categorías</option>
                <option value="PROGRAMACION">Programación</option>
                <option value="FRONTEND">Frontend</option>
                <option value="BACKEND">Backend</option>
                <option value="MOBILE">Mobile</option>
                <option value="DEVOPS">DevOps</option>
                <option value="DATA_SCIENCE">Data Science</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Año</label>
              <input
                type="number"
                placeholder="Ej: 2026"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Filtrar</button>
              {isFiltered && (
                <button type="button" className="btn" onClick={handleClearFilters} style={{ padding: '0.5rem 1rem' }}>Limpiar</button>
              )}
            </div>
          </form>

          {/* Topic List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando tópicos...</div>
          ) : topics.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <h3>No se encontraron tópicos</h3>
              <p style={{ marginTop: '0.5rem' }}>Sé el primero en iniciar una conversación.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="card fade-in"
                  onClick={() => onSelectTopic(topic.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    padding: '1.5rem',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      <strong>{topic.curso}</strong>
                      <span style={{ opacity: 0.4 }}>•</span>
                      <span>Creado por <strong>{topic.autor}</strong></span>
                      <span style={{ opacity: 0.4 }}>•</span>
                      <span>{formatDate(topic.fechaCreacion)}</span>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      background: !topic.estaSolucionado ? 'rgba(255, 0, 127, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: !topic.estaSolucionado ? 'var(--primary-color)' : 'var(--success-color)',
                      fontWeight: 700
                    }}>
                      {!topic.estaSolucionado ? 'Abierto' : 'Solucionado'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.25rem 0 0.5rem', color: 'var(--text-primary)' }}>
                      {topic.titulo}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {topic.mensaje}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="btn"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                ◀ Anterior
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Página {page + 1} de {totalPages}
              </span>
              <button
                className="btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente ▶
              </button>
            </div>
          )}
        </div>

        {/* Sidebar (Right side) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Leaderboard Card */}
          <div className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🏆 Top Colaboradores
            </h3>
            
            {leaderboard.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cargando ranking...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {leaderboard.map((user, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div style={{
                      width: '1.75rem',
                      height: '1.75rem',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--text-secondary)',
                      fontSize: '0.8rem'
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{user.nombre}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user.perfil}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                      {user.puntos} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats/Inspirational Card */}
          <div className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>📈 Comunidad ForoHub</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>
              ¡Ayuda a otros respondiendo dudas! Cada respuesta solucionada te otorga **+20 puntos** y te acerca al primer puesto del ranking.
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && createPortal(
        <CreateTopicModal
          token={token}
          onClose={() => setIsModalOpen(false)}
          onTopicCreated={() => {
            setPage(0);
            fetchTopics();
          }}
        />,
        document.body
      )}

      {isManageCoursesOpen && createPortal(
        <ManageCourses
          token={token}
          showToast={showToast}
          onClose={() => setIsManageCoursesOpen(false)}
        />,
        document.body
      )}
    </div>
  );
}

export default Dashboard;
