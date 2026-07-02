import React, { useState, useEffect } from 'react';

function StatsDashboard({ token, user, userId, showToast }) {
  const [topics, setTopics] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch topics to calculate stats
        const topicsResponse = await fetch('/topico/listar?size=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const coursesResponse = await fetch('/curso/listar?size=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (topicsResponse.ok && coursesResponse.ok) {
          const topicsData = await topicsResponse.json();
          const coursesData = await coursesResponse.json();
          setTopics(topicsData.content || []);
          setCursos(coursesData.content || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPoints = async () => {
      try {
        const response = await fetch('/usuario/leaderboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const me = data.find(u => u.nombre === user);
          if (me) {
            setUserPoints(me.puntos || 0);
            localStorage.setItem('userPoints', me.puntos);
          }
        }
      } catch (e) {
        console.error('Error fetching user points:', e);
      }
    };

    fetchData();
    fetchUserPoints();
  }, [token, user]);

  // Calculations
  const totalTopics = topics.length;
  const solvedTopics = topics.filter(t => t.status === 'SOLUCIONADO' || t.status === 'SOLVED' || t.status === 'CERRADO').length;
  const activeTopics = totalTopics - solvedTopics;
  const resolutionRate = totalTopics > 0 ? Math.round((solvedTopics / totalTopics) * 100) : 0;

  // Calculate top courses
  const courseCountMap = {};
  topics.forEach(t => {
    const courseName = t.curso || 'Otros';
    courseCountMap[courseName] = (courseCountMap[courseName] || 0) + 1;
  });

  const sortedCourses = Object.entries(courseCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Badges Definitions
  const badges = [
    {
      id: 'pioneer',
      name: '🌱 Pionero de ForoHub',
      requirement: 0,
      description: '¡Te uniste a la comunidad y diste tus primeros pasos!',
      icon: '🚀'
    },
    {
      id: 'helper',
      name: '🤝 Colaborador Activo',
      requirement: 100,
      description: 'Superaste los 100 puntos aportando valor al foro.',
      icon: '🔥'
    },
    {
      id: 'expert',
      name: '🧠 Experto Solucionador',
      requirement: 300,
      description: 'Alcanzaste los 300 puntos guiando con tus respuestas.',
      icon: '⚡'
    },
    {
      id: 'legend',
      name: '👑 Leyenda del Foro',
      requirement: 500,
      description: 'Superaste los 500 puntos. Eres un pilar indispensable de ForoHub.',
      icon: '🏆'
    }
  ];

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Estadísticas & Logros
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Mide tu participación, desbloquea insignias y conoce el estado de la comunidad.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Cargando analíticas...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          
          {/* Row 1: Profile & Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* User Profile Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', background: 'var(--bg-glass)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>{user}</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                {localStorage.getItem('perfil')?.replace('ROLE_', '') || 'Estudiante'}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid var(--border-color)', display: 'inline-block', margin: '0 auto' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Puntuación Acumulada</span>
                <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{userPoints} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--primary-color)' }}>pts</span></span>
              </div>
            </div>

            {/* Badges List */}
            <div className="card" style={{ padding: '2rem', background: 'var(--bg-glass)', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                🏅 Mis Insignias
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {badges.map((badge) => {
                  const isUnlocked = userPoints >= badge.requirement;
                  return (
                    <div
                      key={badge.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem 1rem',
                        background: isUnlocked ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.15)',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isUnlocked ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255,255,255,0.01)',
                        opacity: isUnlocked ? 1 : 0.5,
                        position: 'relative',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.75rem',
                          background: isUnlocked ? 'var(--accent-gradient)' : '#271c47',
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isUnlocked ? '0 4px 12px var(--primary-glow)' : 'none'
                        }}
                      >
                        {isUnlocked ? badge.icon : '🔒'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.15rem 0', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {badge.name}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                          {isUnlocked ? badge.description : `Requiere ${badge.requirement} puntos.`}
                        </p>
                      </div>
                      {isUnlocked && (
                        <span style={{ position: 'absolute', top: '0.5rem', right: '0.75rem', fontSize: '0.65rem', color: 'var(--success-color)', fontWeight: 800 }}>
                          ✓ Desbloqueada
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Row 2: Charts and stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* Resolution Rate SVG Indicator */}
            <div className="card" style={{ padding: '2rem', background: 'var(--bg-glass)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', alignSelf: 'flex-start', color: 'var(--text-primary)' }}>
                🎯 Tasa de Resolución
              </h3>
              
              <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '1.5rem' }}>
                <svg width="100%" height="100%" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Circle */}
                  <circle
                    cx="20"
                    cy="20"
                    r="15.915"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="3.5"
                  />
                  {/* Animated Progress Circle */}
                  <circle
                    cx="20"
                    cy="20"
                    r="15.915"
                    fill="transparent"
                    stroke="url(#gradient)"
                    strokeWidth="3.5"
                    strokeDasharray={`${resolutionRate} ${100 - resolutionRate}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff007f" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center Percentage Label */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', display: 'block' }}>
                    {resolutionRate}%
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Resuelto</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', width: '100%', justifyContent: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Tópicos Totales</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalTopics}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success-color)', display: 'block' }}>Resueltos</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{solvedTopics}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', display: 'block' }}>Pendientes</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{activeTopics}</span>
                </div>
              </div>
            </div>

            {/* Top Active Courses */}
            <div className="card" style={{ padding: '2rem', background: 'var(--bg-glass)', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                🔥 Cursos con Mayor Actividad
              </h3>
              {sortedCourses.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
                  No hay suficiente actividad registrada para mostrar estadísticas.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
                  {sortedCourses.map(([courseName, count], index) => {
                    const percentage = totalTopics > 0 ? Math.round((count / totalTopics) * 100) : 0;
                    return (
                      <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{courseName}</span>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{count} consultas ({percentage}%)</span>
                        </div>
                        {/* Custom CSS Bar Graph */}
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: '100%',
                              background: 'var(--accent-gradient)',
                              borderRadius: '4px',
                              boxShadow: '0 0 8px var(--primary-glow)',
                              transition: 'width 0.5s ease-out'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default StatsDashboard;
