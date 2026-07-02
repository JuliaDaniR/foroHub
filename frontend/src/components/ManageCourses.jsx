import React, { useState, useEffect, useRef } from 'react';

function ManageCourses({ token, showToast, onClose }) {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('LENGUAJES_DE_PROGRAMACION');
  const [subcategoria, setSubcategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tags, setTags] = useState('');
  const [cursos, setCursos] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Ref to scroll modal content back to top
  const modalContentRef = useRef(null);

  const fetchCursos = async () => {
    try {
      const response = await fetch('/curso/listar?size=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCursos(data.content || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, [token]);

  const handleAiAutocomplete = async () => {
    if (!nombre.trim()) {
      setError('Por favor, escribe primero el "Nombre del Curso" en el formulario de abajo para poder autocompletar.');
      return;
    }
    setLoadingAi(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/ai/autocomplete-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, categoriaPrincipal: categoria })
      });
      if (response.ok) {
        const data = await response.json();
        setDescripcion(data.descripcion || '');
        setTags(data.tags || '');
        setSuccess('¡Detalles del curso generados con IA!');
      } else {
        throw new Error('Error al conectar con el servicio de IA para autocompletar.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleStartEdit = (course) => {
    setEditingCourseId(course.id);
    setNombre(course.nombre);
    setCategoria(course.categoriaPrincipal);
    setSubcategoria(course.subcategoria);
    setDescripcion(course.descripcion || '');
    setTags(course.tags || '');
    setError('');
    setSuccess('');

    // Smooth scroll back to top of the modal form
    if (modalContentRef.current) {
      modalContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleDeleteCourse = (courseId, courseName) => {
    setCourseToDelete({ id: courseId, nombre: courseName });
  };

  const confirmDeleteCourse = async (courseId, courseName) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/curso/eliminar/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        if (showToast) {
          showToast('Curso Eliminado', `El curso "${courseName}" ha sido eliminado.`, 'success');
        } else {
          setSuccess(`Curso "${courseName}" eliminado con éxito.`);
        }
        if (editingCourseId === courseId) {
          clearForm();
        }
        setCourseToDelete(null);
        fetchCursos();
      } else {
        throw new Error('No se pudo eliminar el curso.');
      }
    } catch (err) {
      setError(err.message);
      setCourseToDelete(null);
    }
  };

  const clearForm = () => {
    setNombre('');
    setSubcategoria('');
    setDescripcion('');
    setTags('');
    setEditingCourseId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const url = editingCourseId ? '/curso/actualizar' : '/curso/registrar';
    const method = editingCourseId ? 'PUT' : 'POST';

    const payload = {
      nombre,
      categoriaPrincipal: categoria,
      subcategoria,
      descripcion,
      tags
    };

    if (editingCourseId) {
      payload.id = editingCourseId;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(editingCourseId ? 'Error al actualizar el curso.' : 'Error al registrar el curso.');
      }

      setSuccess(editingCourseId ? 'Curso actualizado exitosamente.' : 'Curso creado exitosamente.');
      clearForm();
      fetchCursos();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  return (
    <div className="modal-overlay">
      <div
        ref={modalContentRef}
        className="modal-content fade-in"
        style={{ maxWidth: '850px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {editingCourseId ? '✏️ Editar Curso' : '📚 Administración de Cursos'}
          </h3>
          <button className="btn" onClick={onClose} style={{ padding: '0.25rem 0.5rem' }}>✕</button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger-color)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            textAlign: 'left'
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
            marginBottom: '1.25rem',
            textAlign: 'left'
          }}>
            ✅ {success}
          </div>
        )}

        {/* AI Autocomplete Panel */}
        <div
          className="card"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '1rem',
            border: '1px dashed var(--primary-color)',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0 }}>
              🤖 Asistente de Cursos IA
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Escribe el nombre y elige la categoría abajo, luego presiona para rellenar la descripción y tags
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAiAutocomplete}
            disabled={loadingAi || !nombre.trim()}
            style={{ width: '100%', justifyContent: 'center', height: '42px' }}
          >
            {loadingAi ? 'Generando contenido con IA...' : '✨ Autocompletar Descripción y Tags con IA'}
          </button>
        </div>

        {/* Creation / Editing Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '220px', textAlign: 'left' }} className="form-group">
              <label>Nombre del Curso</label>
              <input
                list="course-suggestions"
                type="text"
                placeholder="Ej: Java Avanzado"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              <datalist id="course-suggestions">
                <option value="Java Básico" />
                <option value="Java Avanzado" />
                <option value="Spring Boot Framework" />
                <option value="React SPA" />
                <option value="JavaScript Moderno" />
                <option value="Introducción a Docker" />
                <option value="Bases de Datos MySQL" />
              </datalist>
            </div>
            
            <div style={{ flex: 1.5, minWidth: '180px', textAlign: 'left' }} className="form-group">
              <label>Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
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

            <div style={{ flex: 1.2, minWidth: '140px', textAlign: 'left' }} className="form-group">
              <label>Subcategoría</label>
              <input
                list="subcategory-suggestions"
                type="text"
                placeholder="Ej: Java"
                value={subcategoria}
                onChange={(e) => setSubcategoria(e.target.value)}
                required
              />
              <datalist id="subcategory-suggestions">
                <option value="Java" />
                <option value="JavaScript" />
                <option value="Spring" />
                <option value="React" />
                <option value="HTML / CSS" />
                <option value="SQL" />
                <option value="Docker" />
              </datalist>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '250px', textAlign: 'left' }} className="form-group">
              <label>Descripción del Curso</label>
              <textarea
                rows="5"
                placeholder="Ingresa una breve descripción de qué trata este curso..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
              ></textarea>
            </div>

            <div style={{ flex: 1.2, minWidth: '180px', textAlign: 'left' }} className="form-group">
              <label>Etiquetas (separadas por comas)</label>
              <input
                type="text"
                placeholder="Ej: Java, Backend, Spring"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            {editingCourseId && (
              <button type="button" className="btn" onClick={clearForm} style={{ padding: '0.6rem 1.5rem' }}>
                Cancelar Edición
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 2rem' }} disabled={loading}>
              {loading ? 'Procesando...' : editingCourseId ? 'Guardar Cambios' : 'Crear Curso'}
            </button>
          </div>
        </form>

        {/* Courses Listing Cards Grid */}
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'left' }}>
          Cursos Disponibles ({cursos.length})
        </h4>
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', background: 'rgba(0,0,0,0.1)' }}>
          {cursos.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No hay cursos registrados.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem' }}>
              {cursos.map((c) => {
                const tagList = c.tags ? c.tags.split(',').map((t) => t.trim()) : [];
                return (
                  <div
                    key={c.id}
                    className="card fade-in"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      background: 'var(--bg-glass)',
                      borderColor: 'var(--border-color)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {formatCategoryName(c.categoriaPrincipal)} • {c.subcategoria}
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(c)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.1rem 0.25rem' }}
                          title="Editar curso"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(c.id, c.nombre)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.1rem 0.25rem' }}
                          title="Eliminar curso"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {c.nombre}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0', minHeight: '36px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {c.descripcion || 'Sin descripción disponible.'}
                    </p>
                    {tagList.length > 0 && tagList[0] !== "" && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                        {tagList.map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.65rem',
                              background: 'rgba(255,255,255,0.03)',
                              color: 'var(--text-secondary)',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                              fontWeight: 600
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {courseToDelete && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content fade-in" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--danger-color)' }}>
              🗑️ ¿Eliminar Curso?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '2.25rem' }}>
              ¿Estás seguro de que deseas eliminar el curso <strong>{courseToDelete.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--danger-color)', justifyContent: 'center' }}
                onClick={() => confirmDeleteCourse(courseToDelete.id, courseToDelete.nombre)}
              >
                Confirmar y Eliminar
              </button>
              <button className="btn" style={{ justifyContent: 'center' }} onClick={() => setCourseToDelete(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCourses;
