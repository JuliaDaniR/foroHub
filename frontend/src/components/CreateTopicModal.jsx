import React, { useState, useEffect } from 'react';

function CreateTopicModal({ token, onClose, onTopicCreated }) {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // AI assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setLoadingAi(true);
    setError('');
    try {
      const response = await fetch('/ai/generate-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      if (response.ok) {
        const data = await response.json();
        setTitulo(data.titulo);
        setMensaje(data.mensaje);
        // Find matching course dynamically from loaded database courses
        const lowerPrompt = aiPrompt.toLowerCase();
        const lowerTitle = (data.titulo || '').toLowerCase();
        
        const matchedCourse = cursos.find(c => {
          const name = c.nombre.toLowerCase();
          const sub = c.subcategoria.toLowerCase();
          const tagList = c.tags ? c.tags.split(',').map(t => t.trim().toLowerCase()) : [];
          
          return (
            lowerPrompt.includes(name) || name.includes(lowerPrompt) ||
            lowerPrompt.includes(sub) || sub.includes(lowerPrompt) ||
            lowerTitle.includes(name) || lowerTitle.includes(sub) ||
            tagList.some(tag => lowerPrompt.includes(tag) || lowerTitle.includes(tag))
          );
        });
        
        if (matchedCourse) {
          setCursoId(matchedCourse.id.toString());
        }
      } else {
        throw new Error('Error al conectar con la IA.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
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
    fetchCursos();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const autorId = localStorage.getItem('userId');

    try {
      const response = await fetch('/topico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          mensaje,
          autorId: parseInt(autorId),
          cursoId: parseInt(cursoId),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Error al crear el tópico. Verifica si es duplicado.');
      }

      onTopicCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in" style={{ maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Nuevo Tópico</h3>
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
            marginBottom: '1.25rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* AI Drafting Panel */}
          <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px dashed var(--primary-color)', marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>🤖 Redactar con IA</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                placeholder="Escribe tu idea (ej: error spring boot, react hooks...)"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                style={{ flex: 1, padding: '0.5rem' }}
              />
              <button type="button" className="btn btn-primary" onClick={handleAiGenerate} disabled={loadingAi}>
                {loadingAi ? 'Generando...' : '✨ Generar'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="topic-title">Título</label>
            <input
              id="topic-title"
              type="text"
              placeholder="¿De qué trata tu consulta?"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="topic-course">Curso</label>
            <select
              id="topic-course"
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              required
            >
              <option value="">Selecciona un curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.subcategoria})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="topic-message">Mensaje</label>
            <textarea
              id="topic-message"
              rows="10"
              style={{ minHeight: '260px', width: '100%', resize: 'vertical' }}
              placeholder="Describe detalladamente tu pregunta o problema..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Publicar Tópico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTopicModal;
