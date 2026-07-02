import React, { useState, useEffect } from 'react';

function ExploreCourses({ token, showToast }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  // Followed courses state (stored in localStorage)
  const [followedCourses, setFollowedCourses] = useState([]);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await fetch('/curso/listar?size=100', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCursos(data.content || []);
        } else {
          throw new Error('Error al cargar la lista de cursos.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();

    // Load followed courses from localStorage
    const saved = localStorage.getItem('followed_courses');
    if (saved) {
      try {
        setFollowedCourses(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [token]);

  const handleToggleFollow = (courseId, courseName) => {
    let updated;
    if (followedCourses.includes(courseId)) {
      updated = followedCourses.filter(id => id !== courseId);
      if (showToast) {
        showToast('Curso Dejado de Seguir', `Ya no recibirás prioridades para "${courseName}".`, 'info');
      }
    } else {
      updated = [...followedCourses, courseId];
      if (showToast) {
        showToast('Siguiendo Curso', `¡Ahora sigues "${courseName}"! Verás sus temas primero.`, 'success');
      }
    }
    setFollowedCourses(updated);
    localStorage.setItem('followed_courses', JSON.stringify(updated));
  };

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag(''); // clear filter if clicked again
    } else {
      setSelectedTag(tag);
    }
  };

  const formatCategoryName = (cat) => {
    if (!cat) return '';
    const categoryMap = {
      'LENGUAJES_DE_PROGRAMACION': 'Programación',
      'FRAMEWORKS_Y_BIBLIOTECAS': 'Frameworks & Libs',
      'DESARROLLO_WEB': 'Desarrollo Web',
      'DESARROLLO_DE_APLICACIONES_MOVILES': 'Desarrollo Móvil',
      'DEVOPS_Y_DESPLIEGUE': 'DevOps',
      'BASES_DE_DATOS_Y_ALMACENAMIENTO_DE_DATOS': 'Bases de Datos',
      'INTELIGENCIA_ARTIFICIAL_Y_CIENCIA_DE_DATOS': 'IA & Ciencia de Datos',
      'SEGURIDAD_INFORMATICA': 'Ciberseguridad',
      'OTROS': 'Otros'
    };
    return categoryMap[cat] || cat.replace(/_/g, ' ');
  };

  // Filter logic
  const filteredCursos = cursos.filter(c => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.subcategoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? c.categoriaPrincipal === selectedCategory : true;
    
    let matchesTag = true;
    if (selectedTag) {
      const tagList = c.tags ? c.tags.split(',').map(t => t.trim().toLowerCase()) : [];
      matchesTag = tagList.includes(selectedTag.toLowerCase());
    }

    return matchesSearch && matchesCategory && matchesTag;
  });

  // Extract all unique tags
  const allTags = Array.from(
    new Set(
      cursos
        .flatMap(c => c.tags ? c.tags.split(',').map(t => t.trim()) : [])
        .filter(t => t.length > 0)
    )
  );

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Explorar Cursos
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Navega por las materias, descubre tags y sigue tus cursos preferidos.</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', marginBottom: '2rem', background: 'var(--bg-glass)' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 2, minWidth: '240px', textAlign: 'left' }} className="form-group">
            <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Buscador</label>
            <input
              type="text"
              placeholder="Buscar curso o subcategoría (ej: Java, React...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ flex: 1, minWidth: '180px', textAlign: 'left' }} className="form-group">
            <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', height: '42px' }}
            >
              <option value="">Todas las Categorías</option>
              <option value="LENGUAJES_DE_PROGRAMACION">Programación</option>
              <option value="FRAMEWORKS_Y_BIBLIOTECAS">Frameworks & Libs</option>
              <option value="DESARROLLO_WEB">Desarrollo Web</option>
              <option value="DESARROLLO_DE_APLICACIONES_MOVILES">Mobile</option>
              <option value="DEVOPS_Y_DESPLIEGUE">DevOps</option>
              <option value="BASES_DE_DATOS_Y_ALMACENAMIENTO_DE_DATOS">Bases de Datos</option>
              <option value="INTELIGENCIA_ARTIFICIAL_Y_CIENCIA_DE_DATOS">IA & Ciencia de Datos</option>
              <option value="SEGURIDAD_INFORMATICA">Ciberseguridad</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>

          {(searchTerm || selectedCategory || selectedTag) && (
            <button
              className="btn"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedTag('');
              }}
              style={{ padding: '0.6rem 1.25rem', marginTop: '1.25rem' }}
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        {/* Popular Tags Filter */}
        {allTags.length > 0 && (
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginRight: '0.75rem', fontWeight: 700 }}>
              Filtrar por Etiqueta:
            </span>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
              {allTags.map((tag) => {
                const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
                return (
                  <span
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    style={{
                      fontSize: '0.75rem',
                      background: isSelected ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '16px',
                      border: isSelected ? 'none' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      boxShadow: isSelected ? '0 2px 8px var(--primary-glow)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    #{tag}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Cargando cursos...</div>
      ) : error ? (
        <div className="card" style={{ color: 'var(--danger-color)', padding: '2rem' }}>⚠️ Error: {error}</div>
      ) : filteredCursos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <h3>No se encontraron cursos</h3>
          <p style={{ marginTop: '0.5rem' }}>Prueba con otros términos de búsqueda o filtros.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
          {filteredCursos.map((c) => {
            const isFollowed = followedCourses.includes(c.id);
            const tagList = c.tags ? c.tags.split(',').map(t => t.trim()) : [];
            return (
              <div
                key={c.id}
                className="card fade-in"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  background: 'var(--bg-glass)',
                  borderColor: isFollowed ? 'var(--primary-color)' : 'var(--border-color)',
                  boxShadow: isFollowed ? '0 8px 30px var(--primary-glow)' : 'var(--shadow-sm)',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {formatCategoryName(c.categoriaPrincipal)}
                  </span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.5rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                    {c.subcategoria}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.25rem 0 0', color: 'var(--text-primary)' }}>
                  {c.nombre}
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.25rem 0', flex: 1, minHeight: '60px' }}>
                  {c.descripcion || 'Este curso no cuenta con una descripción detallada cargada aún.'}
                </p>

                {tagList.length > 0 && tagList[0] !== "" && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                    {tagList.map((tag, idx) => (
                      <span
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagClick(tag);
                        }}
                        style={{
                          fontSize: '0.65rem',
                          background: selectedTag.toLowerCase() === tag.toLowerCase() ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
                          color: selectedTag.toLowerCase() === tag.toLowerCase() ? 'white' : 'var(--text-secondary)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleToggleFollow(c.id, c.nombre)}
                  className={`btn ${isFollowed ? '' : 'btn-primary'}`}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '0.5rem',
                    background: isFollowed ? 'rgba(255,255,255,0.03)' : 'var(--accent-gradient)',
                    color: isFollowed ? 'var(--text-primary)' : 'white',
                    border: isFollowed ? '1px solid var(--border-color)' : 'none',
                    height: '38px',
                    fontWeight: 700
                  }}
                >
                  {isFollowed ? '🤝 Siguiendo' : '⭐ Seguir Curso'}
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default ExploreCourses;
